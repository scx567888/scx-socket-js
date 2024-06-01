import {FrameCreator} from "./FrameCreator.js";
import {FrameSender} from "./FrameSender.js";
import {DuplicateFrameChecker} from "./DuplicateFrameChecker.js";
import {RequestManager} from "./RequestManager.js";

class ScxSocketStatus {

    frameCreator;
    duplicateFrameChecker;
    frameSender;
    requestManager;

    constructor(options) {
        this.frameCreator = new FrameCreator();
        this.frameSender = new FrameSender();
        this.duplicateFrameChecker = new DuplicateFrameChecker(options.getDuplicateFrameCheckerClearTimeout());
        this.requestManager = new RequestManager();
    }

}

export {
    ScxSocketStatus,
};
