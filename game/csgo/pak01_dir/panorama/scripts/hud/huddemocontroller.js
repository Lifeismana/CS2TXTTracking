"use strict";
/// <reference path="../csgo.d.ts" />
function EatClick() {
    return true;
}
const cp = $.GetContextPanel();
const slider = $("#Slider");
const speeds = $("#SpeedControls").Children().slice(1);
let bActive = cp.BHasClass("active");
$.RegisterForUnhandledEvent("DemoToggleUI", () => {
    bActive = !bActive;
    cp.SetHasClass("active", bActive);
    cp.SetInputCaptureEnabled(bActive);
});
let lastState = null;
let bRoundsMarked = false;
function FrameUpdate() {
    if (!cp.visible) {
        $.Schedule(1, FrameUpdate);
        return;
    }
    $.Schedule(0, FrameUpdate);
    const state = cp.GetDemoControllerState();
    if (state == null) {
        lastState = null;
        return;
    }
    if (lastState == null || lastState.sFileName !== state.sFileName) {
        bRoundsMarked = false;
        let sFileName = state.sFileName.replaceAll("\\", "/");
        let nSlashIndex = sFileName.lastIndexOf("/");
        if (nSlashIndex !== -1)
            sFileName = sFileName.substring(nSlashIndex + 1);
        cp.SetDialogVariable("total_time", TicksToTimeText(state.nTotalTicks, state.nSecondsPerTick));
    }
    lastState = state;
    const pMarkers = $("#RoundMarkers");
    if (pMarkers.actuallayoutwidth > 0 && !bRoundsMarked) {
        bRoundsMarked = true;
        pMarkers.RemoveAndDeleteChildren();
        const pThumb = $("#SliderThumb");
        const nThumbWidth = pThumb.actuallayoutwidth / pThumb.actualuiscale_x;
        const nMarkersWidth = (pMarkers.actuallayoutwidth / pThumb.actualuiscale_x) - nThumbWidth;
        for (let i = 0; i < state.RoundStarts.length; i++) {
            const nStartTick = state.RoundStarts[i].nTick;
            const nEndTick = i < state.RoundStarts.length - 1 ? state.RoundStarts[i + 1].nTick - 1 : state.nTotalTicks;
            let nLeft = nStartTick / state.nTotalTicks * nMarkersWidth + nThumbWidth / 2;
            let nWidth = (nEndTick - nStartTick) / state.nTotalTicks * nMarkersWidth;
            if (i === 0) {
                nWidth += nLeft;
                nLeft = 0;
            }
            else if (i === state.RoundStarts.length - 1) {
                nWidth += nThumbWidth / 2;
            }
            const pMarker = $.CreatePanel("Panel", pMarkers, "", { class: i % 2 === 0 ? "even" : "odd" });
            pMarker.style.marginLeft = nLeft + "px";
            pMarker.style.width = nWidth + "px";
        }
    }
    cp.SetHasClass("paused", state.bIsPaused);
    slider.min = 0;
    slider.max = state.nTotalTicks;
    if (!slider.mousedown) {
        slider.value = state.nTick;
        cp.SetDialogVariable("current_time", TicksToTimeText(state.nTick, state.nSecondsPerTick));
        cp.SetDialogVariableInt("round_number", TicksToRound(state.nTick, state.RoundStarts));
    }
    speeds[0].SetHasClass("selected", state.fTimeScale === .25);
    speeds[1].SetHasClass("selected", state.fTimeScale === .5);
    speeds[2].SetHasClass("selected", state.fTimeScale === 1);
    speeds[3].SetHasClass("selected", state.fTimeScale === 2);
    speeds[4].SetHasClass("selected", state.fTimeScale === 4);
}
$.Schedule(0, FrameUpdate);
$.RegisterEventHandler("SliderReleased", slider, (_, fValue) => {
    if (lastState == null)
        return true;
    cp.SetDialogVariable("current_time", TicksToTimeText(fValue, lastState.nSecondsPerTick));
    cp.SetDialogVariableInt("round_number", TicksToRound(fValue, lastState.RoundStarts));
    cp.GotoTick(Math.floor(fValue));
    return true;
});
$.RegisterEventHandler("SliderValueChanged", slider, (_, fValue) => {
    if (lastState == null)
        return true;
    cp.SetDialogVariable("current_time", TicksToTimeText(fValue, lastState.nSecondsPerTick));
    cp.SetDialogVariableInt("round_number", TicksToRound(fValue, lastState.RoundStarts));
    return true;
});
function OnPlayClicked() {
    cp.SetPaused(!cp.BHasClass("paused"));
    return true;
}
function OnStepTime(fStep) {
    if (lastState) {
        cp.GotoTick(lastState.nTick + (fStep / lastState.nSecondsPerTick));
    }
    return true;
}
function OnStepRound(nStep) {
    if (lastState && lastState.RoundStarts.length > 0) {
        const nRoundIndex = lastState.RoundStarts.findIndex(r => r.nTick > lastState.nTick) - 1;
        let nNewRound = nRoundIndex + nStep;
        if (nNewRound < 0)
            nNewRound = 0;
        else if (nNewRound > lastState.RoundStarts.length - 1)
            nNewRound = lastState.RoundStarts.length - 1;
        cp.GotoTick(lastState.RoundStarts[nNewRound].nTick);
    }
    return true;
}
function OnTimeScale(fTimeScale) {
    cp.SetTimeScale(fTimeScale);
    return true;
}
function TicksToTimeText(nTick, nSecondsPerTick) {
    const nTime = Math.floor(nSecondsPerTick * nTick);
    const nSeconds = nTime % 60;
    const nMinutes = Math.floor(nTime / 60);
    const sSeconds = nSeconds < 10 ? "0" + nSeconds : nSeconds.toString();
    return `${nMinutes}:${sSeconds}`;
}
function TicksToRound(nTick, rounds) {
    if (rounds.length === 0 || rounds[0].nTick > nTick)
        return 0;
    for (let i = 0; i < rounds.length; i++) {
        if (nTick < rounds[i].nTick) {
            return i - 1;
        }
    }
    return rounds.length;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHVkZGVtb2NvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodWRkZW1vY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUNBQXFDO0FBR3JDLFNBQVMsUUFBUTtJQUViLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFvQ0QsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBNkIsQ0FBQztBQUMxRCxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUUsU0FBUyxDQUFjLENBQUM7QUFDMUMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFFLGdCQUFnQixDQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFFLENBQUMsQ0FBRSxDQUFDO0FBRzVELElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUUsUUFBUSxDQUFFLENBQUM7QUFDdkMsQ0FBQyxDQUFDLHlCQUF5QixDQUFFLGNBQWMsRUFBRSxHQUFHLEVBQUU7SUFFOUMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDO0lBQ25CLEVBQUUsQ0FBQyxXQUFXLENBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBRSxPQUFPLENBQUUsQ0FBQztBQUN6QyxDQUFDLENBQUUsQ0FBQztBQUVKLElBQUksU0FBUyxHQUF3QyxJQUFJLENBQUM7QUFDMUQsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzFCLFNBQVMsV0FBVztJQUVoQixJQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFDaEI7UUFDSSxDQUFDLENBQUMsUUFBUSxDQUFFLENBQUMsRUFBRSxXQUFXLENBQUUsQ0FBQztRQUM3QixPQUFPO0tBQ1Y7SUFFRCxDQUFDLENBQUMsUUFBUSxDQUFFLENBQUMsRUFBRSxXQUFXLENBQUUsQ0FBQztJQUU3QixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztJQUMxQyxJQUFLLEtB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