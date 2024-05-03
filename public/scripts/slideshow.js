document.addEventListener('DOMContentLoaded', function() {
    const images = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg'];
    let currentIndex = 0;
    const slideshow = document.getElementById('slideshow');
  
    function nextSlide() {
      currentIndex = (currentIndex + 1) % images.length;
      slideshow.innerHTML = `<img src="../assets/images/stadions/${images[currentIndex]}" alt="Voetbalveld">`;
    }
  
    // Start de diavoorstelling
    nextSlide();
  
    // Automatisch wisselen van afbeeldingen elke 5 seconden
    setInterval(nextSlide, 5000);
  });