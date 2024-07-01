import { Type } from "@sinclair/typebox";

export const orderPlacedSchema = Type.Object({
    orderId: Type.String(),
    buyerEmail: Type.String(),
    sellerEmail: Type.String(),
    orderDue: Type.String(),
    amount: Type.String(),
    buyerUsername: Type.String(),
    sellerUsername: Type.String(),
    title: Type.String(),
    description: Type.String(),
    requirements: Type.String(),
    serviceFee: Type.String(),
    total: Type.String(),
    orderUrl: Type.String()
});

export const orderDeliveredSchema = Type.Object({
    orderId: Type.String(),
    buyerUsername: Type.String(),
    sellerUsername: Type.String(),
    title: Type.String(),
    description: Type.String(),
    orderUrl: Type.String(),
    receiverEmail: Type.String()
});

export const orderExtensionSchema = Type.Object({
    orderId: Type.String(),
    buyerUsername: Type.String(),
    sellerUsername: Type.String(),
    originalDate: Type.String(),
    newDate: Type.String(),
    reason: Type.String(),
    orderUrl: Type.String(),
    receiverEmail: Type.String()
});

export const orderExtensionApprovalSchema = Type.Object({
    subject: Type.String(),
    buyerUsername: Type.String(),
    sellerUsername: Type.String(),
    type: Type.String(),
    message: Type.String(),
    header: Type.String(),
    orderUrl: Type.String(),
    receiverEmail: Type.String()
});
