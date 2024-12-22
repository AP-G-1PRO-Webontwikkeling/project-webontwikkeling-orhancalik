import { Request, Response, NextFunction } from "express";

// Middleware om te controleren of de gebruiker ingelogd is
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    // Controleer of er een userId in de sessie staat
    if (req.session && req.session.userId) {
        return next(); // Ga verder als de gebruiker is ingelogd
    }
    req.flash("error", "Je moet ingelogd zijn om deze pagina te bekijken.");
    res.redirect("/login"); // Stuur niet-ingelogde gebruikers naar de loginpagina
}

// Middleware om te controleren of de gebruiker al ingelogd is
export function isLoggedIn(req: Request, res: Response, next: NextFunction) {
    // Als er al een userId in de sessie staat, betekent dit dat de gebruiker ingelogd is
    if (req.session.userId) {
        // Redirect naar de homepage als de gebruiker al ingelogd is
        return res.redirect("/");
    }
    next(); // Laat de route verder uitvoeren als de gebruiker niet is ingelogd
}