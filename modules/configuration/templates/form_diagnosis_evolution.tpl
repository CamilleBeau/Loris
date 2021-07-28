<script language="javascript" src="{$baseurl}/configuration/js/diagnosis_evolution.js">
</script>
<p>Use this page to manage the configuration of the study's diagnosis trajectory.</p>
<p>To configure study subprojects <a href="{$baseurl}/configuration/subproject/">click here</a>. 
To configure study projects <a href="{$baseurl}/configuration/project/">click here</a>.
</p>
</br>

<div class="col-md-3">
<ul class="nav nav-pills nav-stacked" role="tablist" data-tabs="tabs">
    <li class="active"><a id="#newDxTrajectory{$DxEvolutionID}" href="#newDxTrajectory" data-toggle="tab" class="active">New Diagnosis Trajectory</a></li>
    {foreach from=$diagnosisTracks key=DxEvolutionID item=diagnosis name=configContent}
    <li><a id="#diagnosis{$DxEvolutionID}" href="#diagnosis{$DxEvolutionID}" data-toggle="tab">{$diagnosis.Name}</a></li>
    {/foreach}
</ul>
</div>


<div class="col-md-7">
    <div class="tab-content">
        {foreach from=$diagnosisTracks key=DxEvolutionID item=diagnosis name=tabContent}
            <div id="diagnosis{$DxEvolutionID}" class="tab-pane">
                <h2>{$diagnosis.Name} (DxEvolutionID: {$DxEvolutionID})</h2>
                <br>
                <form class="form-horizontal" role="form" method="post" id="form{$DxEvolutionID}">
                    <fieldset>
                        <input type="hidden" class="DxEvolutionID" name="DxEvolutionID" value="{$DxEvolutionID}">
                        <div class="form-group">
                            <div class="col-sm-12 col-md-3">
                                <label class="col-sm-12 control-label">Trajectory Name</label>
                            </div>
                            <div class="col-sm-12 col-md-9">
                                <input class="form-control dxTrajectoryName" name="name" value="{$diagnosis.Name}">
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-12 col-md-3">
                                <label class="col-sm-12 control-label">Visit</label>
                            </div>
                            <div class="col-sm-12 col-md-9">
                                <input list="visits" class="form-control dxTrajectoryVisit" name="visit" value="{$diagnosis.visitLabel}">
                                <datalist id="visits">
                                    {foreach from=$visits key=visit item=label}
                                        <option value="{$visit}">{$label}</option>
                                    {/foreach}
                                </datalist>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-12 col-md-3">
                                <label class="col-sm-12 control-label">Instrument</label>
                            </div>
                            <div class="col-sm-12 col-md-9">
                                <input list="instruments" class="form-control dxTrajectoryInstrumentName" name="instrumentName" value="{$diagnosis.instrumentName}">
                                <datalist id="instruments">
                                {foreach from=$instruments key=instrument item=label}
                                    <option value="{$instrument}">{$label}</option>
                                {/foreach}
                            </datalist>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-12 col-md-3">
                                <label class="col-sm-12 control-label">Source Field</label>
                            </div>
                            <div class="col-sm-12 col-md-9">
                                <input list="sourceFields" class="form-control dxTrajectorySourceField" name="sourceField" value="{$diagnosis.sourceField}">
                                <datalist id="sourceFields">
                                    {foreach from=$sourceFields key=name item=source}
                                        <option value="{$name}">{$source}</option>
                                    {/foreach}
                                </datalist>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-12 col-md-3">
                                <label class="col-sm-12 control-label">Order Number</label>
                            </div>
                            <div class="col-sm-12 col-md-9">
                                <input type="number" class="form-control dxTrajectoryOrderNumber" name="orderNumber" value="{$diagnosis.orderNumber}">
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-offset-3 col-sm-9">
                                <button id="saveDxEvolution{$DxEvolutionID}" class="btn btn-primary saveDxEvolution submit-area">Save</button>
                                <button class="btn btn-default submit-area" type="reset">Reset</button>
                                <label class="saveStatus"></label>
                            </div>
                        </div>

                    </fieldset>
                </form>
            </div>
        {/foreach}
        <div id="diagnosisnew" class="tab-pane active">
            <h3>Diagnosis Evolution</h3>
            </br>
            <form class="form-horizontal" role="form" method="post" id="form{$DxEvolutionID}">
                <fieldset>
                    <input type="hidden" class="DxEvolutionID" name="DxEvolutionID" value="new">
                    <div class="form-group">
                        <div class="col-sm-12 col-md-3">
                            <label class="col-sm-12 control-label" for="name">Trajectory Name</label>
                        </div>
                        <div class="col-sm-12 col-md-9">
                            <input class="form-control dxTrajectoryName" name="name" placeholder="Please add a trajectory name for this diagnosis">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="col-sm-12 col-md-3">
                            <label class="col-sm-12 control-label" for="visits">Visit</label>
                        </div>
                        <div class="col-sm-12 col-md-9">
                            <input list="visits" class="form-control dxTrajectoryVisit" name="visit" placeholder="Please select a visit here">
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
                            <input list="instruments" class="form-control dxTrajectoryInstrumentName" name="instrument" placeholder="Please select an instrument here">
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
                            <input list="sourceFields" class="form-control dxTrajectorySourceField" name="sourceField" placeholder="Please select a source field here">
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
                            <input type="number" class="form-control dxTrajectoryOrderNumber" name="orderNumber" placeholder="Please enter an order here">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="col-sm-offset-3 col-sm-9">
                            <button id="saveDxEvolutionnew" class="btn btn-primary saveDxEvolution submit-area">Save</button>
                            <button class="btn btn-default submit-area" type="reset">Reset</button>
                            <label class="saveStatus"></label>
                        </div>
                    </div>
                </fieldset>
            </form>
        </div>
    </div>
</div>