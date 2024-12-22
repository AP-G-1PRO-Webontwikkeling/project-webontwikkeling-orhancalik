import { ObjectId } from 'mongodb';

export interface PaymentMethod {
    method: string;
    cardDetails?: {
        number: string;
        expiryDate: string;
    };
    bankAccountNumber?: string;
}

export interface Expense {
    _id?: ObjectId;
    description: string;
    amount: number;
    date: Date;
    currency: string;
    paymentMethod: PaymentMethod;
    isIncoming: boolean;
    category: string;
    tags: string[];
    isPaid: boolean;
    userId: ObjectId;
}

export interface Budget {
    monthlyLimit: number;
    notificationThreshold: number;
    isActive: boolean;
}

export interface User {
    _id?: ObjectId;
    name: string;
    email: string;
    expenses: Expense[];
    budget: Budget;
}