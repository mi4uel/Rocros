const faqsTitles = document.querySelectorAll(".faq .head");

faqsTitles.forEach((faq) => {
    const classes = Array.from(faq.classList);
    faq.addEventListener("click", () => {

        if(!classes.find( clase => clase === 'deactivate')){
            const content = faq.nextElementSibling;
            const iconPlus = faq.querySelector('.icon-plus');
            const iconMinus = faq.querySelector('.icon-minus');
    
            faq.parentNode.classList.toggle("active");
    
            if (faq.parentNode.classList.contains("active")) {
                content.style.height = (content.scrollHeight + 30) + "px";
                iconPlus.style.display = "none";
                iconMinus.style.display = "block"; 
            } else {
                content.style.height = "0px"; 
                iconPlus.style.display = "block"; 
                iconMinus.style.display = "none"; 
            }
        }
        
    });
});