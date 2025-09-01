import VerificationEmail from "../../email/verificationEmail";
import resend from "../../libs/resend";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export default async function sendVerificationEmail(
    email: string,
    name: string,
    otp: string
) {
    try {
        await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Hello world',
            react: VerificationEmail({name, otp }),
        });
        console.log('verification email sent successfully')
        return successResponse({}, "verification email sent successfully", 200)
    } catch (error) {
        console.log("failed to send verification email", error)
        return errorResponse("Error occured while sending email", 500, {error})
    }
}