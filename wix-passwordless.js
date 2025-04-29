import { Permissions, webMethod } from "wix-web-module";
import { authentication } from "wix-members-backend";
import { triggeredEmails, contacts } from "wix-crm-backend";
import wixData from 'wix-data';

export const doLoginorRegister = webMethod(
  Permissions.Anyone,
  async (email)=>{
    try{
    let queryResult = await contacts.queryContacts()
    .eq('primaryInfo.email', email)
    .find({suppressAuth: true});

    let sessionToken = null;

    let contact = await queryResult.items.find(
      (item) => item.source.sourceType === "WIX_SITE_MEMBERS"
    );


    if (!contact){
      sessionToken = await generateSessionToken(email);
      queryResult = await contacts.queryContacts()
    .eq('primaryInfo.email', email)
    .find({suppressAuth: true});
      contact = await queryResult.items.find(
      (item) => item.source.sourceType === "WIX_SITE_MEMBERS"
    );

    }
    else{
      sessionToken = await generateSessionToken(email); 
    }

    const code = await saveVerificationCode(email, sessionToken);


    await emailMember(contact._id, code);
    }
    catch(error){
      console.log("error logging in: ", error);
    }
  })

  export const doLogin = webMethod(
    Permissions.Anyone,
    async (email)=>{
      
      try{
        console.log('generating token');

        const sessionToken = await generateSessionToken(email);        

        return {email, token: sessionToken};     
      }
      catch(error){
        console.log('Error logging in: ', error);
      }
    }
  )

 

export const generateSessionToken = webMethod(
    Permissions.Anyone,
    (email) => {
        return authentication
            .generateSessionToken(email)
            .then((sessionToken) => {
                return sessionToken;
            })
            .catch((error) => {
                console.error("Error generating session token:", error);
            });
    },
);

export const loginWithToken = webMethod(
    Permissions.Anyone,
    async ({ token }) => {
        try {
            const session = await authentication.approveByToken(token);
            return session;
        } catch (error) {
            console.error('Error logging in with token:', error);
            throw new Error('Failed to log in with token');
        }
    }
)


function generateVerificationCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

export const saveVerificationCode = webMethod(Permissions.Anyone, async (email, token) => {
    const verifyCode = generateVerificationCode();
    const expiresIn = new Date(Date.now() + 5 * 60 * 1000);
    const sessionToken = token;

    const results = await wixData.query('VerificationCodes').eq('email', email).find();
    if (results.items.length > 0) {
        const item = results.items[0];
        item.verifyCode = verifyCode;
        item.expiresIn = expiresIn;
        item.sessionToken = sessionToken;
        await wixData.update('VerificationCodes', item);
        return verifyCode;
    }
    else {
        await wixData.insert('VerificationCodes', { email, verifyCode, expiresIn, sessionToken });
        return verifyCode;
    }

}
)

export const verifyCodeandLogin = webMethod(Permissions.Anyone, async (email, inputCode) => {
    try {
        const results = await wixData.query('VerificationCodes').eq('email', email).find();
        console.log(results);
        let verifyCode = null;
        let sessionToken = null;

        if (results.items.length === 0) {
            return { success: false, message: 'Invalid code.' };
        }

        const codeData = results.items[0];
        console.log(codeData);

        if (new Date() > new Date(codeData.expiration)) {
            return { success: false, message: 'Code expired. Please refresh the page to try again.' };
        }

        verifyCode = codeData.verifyCode;
        console.log(verifyCode);
        sessionToken = codeData.sessionToken;

        if (verifyCode === inputCode.trim()) {
            return { success: true, message: 'Code matched.', token: sessionToken };

        }
        else {
            return { success: false, message: 'Code did not match. Please check your code and try again.' };
        }
    }
    catch (error) {
        throw new Error(error);
    }

}
)

export const sendCodeBySendGrid = webMethod(Permissions.Anyone, async(email, code) =>{
//todo: add sendgrid option
})

export const emailMember = webMethod(
    Permissions.Anyone,
    async (memberId, verificationCode) => {
        console.log(memberId);
       
        const options = {
            variables: {
                code: verificationCode,
                SITE_URL: "www.integratebeyond.com"
            },
        }

      //must replace with triggered email template
        return triggeredEmails
            .emailMember('Uji2C1Q', memberId, options)
            .then(() => {
                console.log("Email was sent to member");
            })
            .catch((error) => {
                console.error("Error in myEmailMemberFunction:", error);
            });
    });

