import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'test@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
});

export const sendOTPEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: '"DevConnect" <no-reply@devconnect.com>',
    to: email,
    subject: 'Seu Código de Verificação - DevConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4a90e2; text-align: center;">DevConnect</h2>
        <p>Olá,</p>
        <p>Seu código de verificação é:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
          ${code}
        </div>
        <p>Este código expira em 15 minutos.</p>
        <p>Se você não solicitou este código, por favor ignore este e-mail.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">DevConnect - Conectando Desenvolvedores</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=========================================');
      console.log('📧 [DEV] FALHA AO ENVIAR E-MAIL (SMTP)');
      console.log(`Para: ${email}`);
      console.log(`Código OTP: ${code}`);
      console.log('=========================================\n');
      return;
    }
    throw error;
  }
};

export const sendResetPasswordEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: '"DevConnect" <no-reply@devconnect.com>',
    to: email,
    subject: 'Recuperação de Senha - DevConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4a90e2; text-align: center;">DevConnect</h2>
        <p>Olá,</p>
        <p>Você solicitou a redefinição de sua senha. Use o código abaixo para prosseguir:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
          ${code}
        </div>
        <p>Este código expira em 15 minutos.</p>
        <p>Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">DevConnect - Conectando Desenvolvedores</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=========================================');
      console.log('📧 [DEV] FALHA AO ENVIAR E-MAIL (RECUPERAÇÃO)');
      console.log(`Para: ${email}`);
      console.log(`Código OTP: ${code}`);
      console.log('=========================================\n');
      return;
    }
    throw error;
  }
};
