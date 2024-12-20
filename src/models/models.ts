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
    _id?: ObjectId; // MongoDB's unieke ID
    description: string;
    amount: number;
    date: Date; // Datum als Date-object
    currency: string;
    paymentMethod: PaymentMethod;
    isIncoming: boolean;
    category: string;
    tags: string[];
    isPaid: boolean;
    userId: number; // Voeg userId toe
}

export interface Budget {
    monthlyLimit: number;
    notificationThreshold: number;
    isActive: boolean;
}

export interface User {
    _id?: ObjectId; // MongoDB's unieke ID
    name: string;
    email: string;
    expenses: Expense[]; // Verwijzing naar Expense-documenten in de database
    budget: Budget;
}