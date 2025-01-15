$(document).ready(function () {
  $(".ct_toggle_bar").click(function () {
    $(".ct_dashboard_main").toggleClass("ct_side_show");
  });

  $(".ct_multiselect_from_class").select2({
    theme: "bootstrap-5",
    width: $(this).data("width")
      ? $(this).data("width")
      : $(this).hasClass("w-100")
      ? "100%"
      : "style",
    placeholder: $(this).data("placeholder"),
    closeOnSelect: false,
  });
});
