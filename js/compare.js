$(function(){
    $(".compare").twentytwenty({
      default_offset_pct: 0.5, // How much of the before image is visible when the page loads
      orientation: 'horizontal', // Orientation of the before and after images ('horizontal' or 'vertical')
      before_label: 'Input', // Set a custom before label
      after_label: 'Output', // Set a custom after label
      no_overlay: true, //Do not show the overlay with before and after
      move_slider_on_hover: true, // Move slider on mouse hover?
      move_with_handle_only: true, // Allow a user to swipe anywhere on the image to control slider movement. 
      click_to_move: true // Allow a user to click (or tap) anywhere on the image to move the slider to that location.
    });
  });

$('.compare').imagesLoaded(function() {
    $(".compare").twentytwenty({
      default_offset_pct: 0.5, // How much of the before image is visible when the page loads
      orientation: 'horizontal', // Orientation of the before and after images ('horizontal' or 'vertical')
      before_label: 'Input', // Set a custom before label
      after_label: 'Output', // Set a custom after label
      no_overlay: true, //Do not show the overlay with before and after
      move_slider_on_hover: true, // Move slider on mouse hover?
      move_with_handle_only: true, // Allow a user to swipe anywhere on the image to control slider movement. 
      click_to_move: true // Allow a user to click (or tap) anywhere on the image to move the slider to that location.
    });
    console.log("images loaded");
  });

function toggleimage(image_to_show, image_to_hide, btn_to_active, btn_to_normal){
  document.getElementById(image_to_show).style.display = 'block';
  document.getElementById(image_to_hide).style.display = 'none';
  document.getElementById(btn_to_active).className = 'btn active';
  document.getElementById(btn_to_normal).className = 'btn';
}
