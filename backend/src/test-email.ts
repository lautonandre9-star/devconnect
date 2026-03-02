import 'dotenv/config';
import nodemailer from 'nodemailer';

async function testSMTP() {
    console.log('🔍 Testando configuração SMTP...');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`User: ${process.env.SMTP_USER}`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log('✅ Conexão SMTP estabelecida com sucesso!');

        console.log('📧 Tentando enviar e-mail de teste...');
        await transporter.sendMail({
            from: `"DevConnect Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: 'Teste de Configuração DevConnect',
            text: 'Se você está lendo isso, sua configuração SMTP está funcionando!',
            html: '<b>Se você está lendo isso, sua configuração SMTP está funcionando!</b>',
        });
        console.log('🚀 E-mail de teste enviado com sucesso para você mesmo!');
    } catch (error: any) {
        console.error('❌ Erro na configuração SMTP:');
        console.error(error.message);

        if (error.message.includes('535')) {
            console.log('\n💡 DICA: Erro 535 significa falha de autenticação.');
            console.log('Se estiver usando Gmail, certifique-se de usar uma "Senha de App" e não a sua senha normal.');
        }
    }
}

testSMTP();
