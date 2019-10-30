import { Viewer, main } from "./viewer";
import * as utils from "./utils";
import * as timeline from "./timeline";
import * as shaderchunks from "./shaderchunks";

//var viewer = new Viewer();

Object.assign(window, {
	Viewer,
	//viewer,
	main
})

Object.assign(window, utils);
Object.assign(window, timeline);
Object.assign(window, shaderchunks);
