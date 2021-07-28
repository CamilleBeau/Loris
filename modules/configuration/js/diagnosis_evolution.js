$(document).ready(function() {
    $(".saveDxEvolution").click(function(e) {
        var form = $(e.currentTarget).closest('form');

        var DxEvolutionID = $(form.find(".DxEvolutionID")).val();
        var Name = $(form.find(".dxTrajectoryName")).val();
        var visitLabel = $(form.find(".dxTrajectoryVisit")).val();
        var instrumentName = $(form.find(".dxTrajectoryInstrumentName")).val();
        var sourceField = $(form.find(".dxTrajectorySourceField")).val();
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
                        "sourceField" : sourceField,
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
                        .fadeOut(500);
                    }
                }

          );
    });
});
