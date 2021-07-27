<script language="javascript" src="{$baseurl}/configuration/js/diagnosis_evolution.js">
</script>
<p>Use this page to manage the configuration of the study's diagnosis trajectory.</p>
<p>To configure study subprojects <a href="{$baseurl}/configuration/subproject/">click here</a>. 
To configure study projects <a href="{$baseurl}/configuration/project/">click here</a>.
</p>
</br>

<div class="col-md-3">
<ul class="nav nav-pills nav-stacked" role="tablist" data-tabs="tabs">
    <li class="active"><a id="#dxnew{$ProjectID}" href="#dxnew" data-toggle="tab" class="active">New Diagnosis Trajectory</a></li>
    {foreach from=$diagnosisTracks key=k item=dx name=configContent}
    <li><a id="#project{$ProjectID}" href="#project{$ProjectID}" data-toggle="tab">{$project.Name}</a></li>
    {/foreach}
</ul>
</div>

<div class="col-md-7 tab-pane active">
    <h3>Diagnosis Evolution</h3>
    </br>
    <form class="form-horizontal" role="form" method="post" id="form{$dxID}">
        <fieldset>
            <div class="form-group">
                <div class="col-sm-12 col-md-3">
                    <label class="col-sm-12 control-label" for="name">Trajectory Name</label>
                </div>
                <div class="col-sm-12 col-md-9">
                    <input type="text" id="name" class="form-control" name="name" placeholder="Please add a trajectory name for this diagnosis">
                </div>
            </div>
            <div class="form-group">
                <div class="col-sm-12 col-md-3">
                    <label class="col-sm-12 control-label" for="visits">Visit</label>
                </div>
                <div class="col-sm-12 col-md-9">
                    <input list="visits" class="form-control" name="visit" placeholder="Please select a visit here">
                    <datalist id="visits">
                        {foreach from=$visits key=visit item=label}
                            <option value="{$visit}">{$label}</option>
                        {/foreach}
                    </datalist>
                </div>
            </div>
            <div class="form-group">
                <div class="col-sm-12 col-md-3">
                    <label class="col-sm-12 control-label" for="instruments">Instrument</label>
                </div>
                <div class="col-sm-12 col-md-9">
                    <input list="instruments" class="form-control" name="instrument" placeholder="Please select an instrument here">
                    <datalist id="instruments">
                        {foreach from=$instruments key=instrument item=label}
                            <option value="{$instrument}">{$label}</option>
                        {/foreach}
                    </datalist>
                </div>
            </div>
            <div class="form-group">
                <div class="col-sm-12 col-md-3">
                    <label class="col-sm-12 control-label" for="sourceFields">Source Field</label>
                </div>
                <div class="col-sm-12 col-md-9">
                    <input list="sourceFields" class="form-control" name="sourceField" placeholder="Please select a source field here">
                    <datalist id="sourceFields">
                        {foreach from=$sourceFields key=name item=source}
                            <option value="{$name}">{$source}</option>
                        {/foreach}
                    </datalist>
                </div>
            </div>
            <div class="form-group">
                <div class="col-sm-12 col-md-3">
                    <label class="col-sm-12 control-label" for="orderNumber">Order Number</label>
                </div>
                <div class="col-sm-12 col-md-9">
                    <input type="number" class="form-control" name="orderNumber" placeholder="Please enter an order here">
                </div>
            </div>
            <div class="form-group">
                <div class="col-sm-offset-3 col-sm-9">
                    <button class="btn btn-primary submit-area">Add</button>
                    <button class="btn btn-default submit-area" type="reset">Reset</button>
                </div>
            </div>
        </fieldset>
    </form>
</div>