import { Request, Response, NextFunction } from "express";


export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.userId) {
        return next(); // Ga verder als de gebruiker is ingelogd
    }
    req.flash("error", "Je moet ingelogd zijn om deze pagina te bekijken.");
    res.redirect("/login"); // Stuur niet-ingelogde gebruikers naar de loginpagina
}
export function isLoggedIn(req: any, res: any, next: any) {
    if (req.session.userId) {
        // Als de gebruiker al is ingelogd, redirect naar de hoofdpagina
        return res.redirect("/");
    }
    next(); // Laat de route verder uitvoeren als de gebruiker niet is ingelogd
}