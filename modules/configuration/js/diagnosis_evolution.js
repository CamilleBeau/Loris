$(document).ready(function() {
  var count = 0;
  $(".add").click(function (e) {
      e.preventDefault();

      count = count + 1;

      // Field that will be copied
      var currentField = $(this).parent().find(".entry:first-child");
      var name = 'add-sourceField-' + count; 

      // Setup the new form field
      var newField = currentField.clone();   
      newField.find(".form-control").attr('name', name);
      resetForm(newField);
      newField.appendTo($(this).parent().children(":first"));

  });

  $(".saveDxEvolution").click(function(e) {
      var form = $(e.currentTarget).closest('form');

      var DxEvolutionID = $(form.find(".DxEvolutionID")).val();
      var Name = $(form.find(".dxTrajectoryName")).val();
      var visitLabel = $(form.find(".dxTrajectoryVisit")).val();
      var instrumentName = $(form.find(".dxTrajectoryInstrumentName")).val();
      var sourceFields = $(form.find(".dxTrajectorySourceField")).map((input, el) => {
        if (el.value) {
          return el.value
        }
      }).get();
      console.log(sourceFields);
      var orderNumber = $(form.find(".dxTrajectoryOrderNumber")).val();

      e.preventDefault();
      var successClosure = function(i, form) {
        return function() {
          $(form.find(".saveStatus")).text("Successfully saved").css({ 'color': 'green'}).fadeIn(500).delay(1000).fadeOut(500);
          if (DxEvolutionID === 'new') {
            setTimeout(function(){
              location.reload();
            }, 1000);
          } else {
            var diagnosisDiv = document.getElementById(`#diagnosis${DxEvolutionID}`);
            var oldName = diagnosisDiv.innerText;
            diagnosisDiv.innerText = Name;
            var diagnosisHeader = document.getElementById(`diagnosis${DxEvolutionID}`);
            diagnosisHeader.children[0].innerText = Name + diagnosisHeader.children[0].innerText.substring(
              oldName.length
            );
          }
        }
      }

      jQuery.ajax(
        {
            "type" : "post",
            "url" : loris.BaseURL + "/configuration/ajax/updateDiagnosisEvolution.php",
            "data" : {
                "DxEvolutionID" : DxEvolutionID,
                "Name" : Name,
                "visitLabel" : visitLabel,
                "instrumentName" : instrumentName,
                "sourceFields" : sourceFields,
                "orderNumber" : orderNumber,
            },
            "dataType": "json",
            "success" : successClosure(DxEvolutionID, form),
            "error" : function(data) {
              $(form.find(".saveStatus"))
                .text(data.responseJSON.error)
                .css({ 'color': 'red'})
                .fadeIn(500)
                .delay(1000)
                .fadeOut(1000);
            }
        }
      );
  });
});

function resetForm(form) {
  "use strict";

  $(form).find('input:text, input:password, input:file, select, textarea').val('');
  $(form).find('input:radio, input:checkbox')
      .removeAttr('checked').removeAttr('selected');
}
