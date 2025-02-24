/*document.addEventListener('DOMContentLoaded', function () {
  const imagesContainer = document.querySelector('.product-images');
  const images = document.querySelectorAll('.product-images img');
  const scrollSpeed = 5;
  
  function checkVisibility() {
    const windowHeight = window.innerHeight;

    images.forEach(image => {
      const rect = image.getBoundingClientRect();
      if (rect.top < windowHeight && rect.bottom > 0) {
        image.classList.add('visible');
      } else {
        //image.classList.remove('visible');
      }
    });
  }

  if (window.innerWidth >= 1025){
    window.addEventListener('wheel', function (event) {
      event.preventDefault();
      imagesContainer.scrollBy({
        top: event.deltaY * scrollSpeed,
        behavior: 'smooth'
      });
      checkVisibility();
    }, { passive: false });
  }
 

  window.addEventListener('scroll', checkVisibility);
  if (window.innerWidth >= 1025){
    checkVisibility();
  }
  
});*/