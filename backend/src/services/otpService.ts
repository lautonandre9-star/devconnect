import prisma from '../utils/prisma';

export enum OTPType {
    REGISTRATION = 'REGISTRATION',
    PASSWORD_RESET = 'PASSWORD_RESET',
}

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOTP = async (identifier: string, type: OTPType) => {
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Invalidar códigos antigos para o mesmo identificador e tipo
    await prisma.oTP.deleteMany({
        where: {
            identifier,
            type: type as any,
        },
    });

    const otp = await prisma.oTP.create({
        data: {
            identifier,
            code,
            type: type as any,
            expiresAt,
        },
    });

    return otp;
};

export const verifyOTP = async (identifier: string, code: string, type: OTPType): Promise<boolean> => {
    const otp = await prisma.oTP.findFirst({
        where: {
            identifier,
            code,
            type: type as any,
            expiresAt: {
                gt: new Date(),
            },
        },
    });

    if (!otp) return false;

    // Deletar OTP após uso bem sucedido
    await prisma.oTP.delete({
        where: { id: otp.id },
    });

    return true;
};
