export interface ClubDetail {
    id: number;
    clubName: string;
    founded: string;
    stadium: string;
    logo: string;
}

export interface Footballer {
    id: number;
    name: string;
    description: string;
    age: number;
    active: boolean;
    dateOfBirth: string;
    profilePicture: string;
    status: string;
    hobbies: string[];
    clubDetails: ClubDetail;
}