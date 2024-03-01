export interface ClubDetail {
    id: number;
    clubnaam: string;
    opgericht: string;
    stadion: string;
    logo: string;
}

export interface Voetballer {
    id: number;
    naam: string;
    beschrijving: string;
    leeftijd: number;
    actief: boolean;
    geboortedatum: string;
    profielfoto: string;
    status: string;
    hobbies: string[];
    club_details: ClubDetail;
}