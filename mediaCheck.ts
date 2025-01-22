import * as dotenv from 'dotenv';
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();
const apiKey = process.env.gemAPIKey || "";
const fileManager = new GoogleAIFileManager(apiKey);
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
	model: "gemini-1.5-flash",
});

const uploadFile = async (fileName: string) => {
	return await fileManager.uploadFile(`${fileName}`, {
		mimeType: "video/mp4",
		displayName: fileName,
	})
}

const deleteFile = async (uploadResult: any) => {
	fileManager.deleteFile(uploadResult.name)
}

const listUploadedFiles = async () => {
	return await fileManager.listFiles()
}

const checkFileState = async (name: any) => {
	// Poll getFile() on a set interval (10 seconds here) to check file state.
	let file = await fileManager.getFile(name);
	while (file.state === FileState.PROCESSING) {
		process.stdout.write(".")
		// Sleep for 10 seconds
		await new Promise((resolve) => setTimeout(resolve, 7_000))
		// Fetch the file from the API again
		file = await fileManager.getFile(name)
	}

	if (file.state === FileState.FAILED) {
		throw new Error("Video processing failed.");
	}
	console.log(`File ${file.displayName} is ready for inference as ${file.uri}`)
	return file
}
/*  Task we need to feed the reasoning from output 1, to another call. On the reasoning itself. */
const evalVideo = async (uploadResponse: any, invalidParams: string) => {
	const defaultText = `You job is to decide if the video breaks any of the parameters given. Here are the Parameters: ${invalidParams}. Apply reasoning on why the input, either violates or doens't violate the params.
	`

	const videoAnalysisRes = (await model.generateContent([
		{
			fileData: {
				mimeType: uploadResponse.file.mimeType,
				fileUri: uploadResponse.file.uri
			}
		},
		{
			text: defaultText
		},
	])).response.text()

	console.log(videoAnalysisRes)

	const prompt2 = `Your job is to decide if a parameter was broken based on this text: 
	${videoAnalysisRes}.
	Only respond with a single word, If any parameter is broken return "false" , else return "true". 
	`

	const conclusionFromAnalysis = (await model.generateContent(prompt2)).response.text()

	return conclusionFromAnalysis

}

const paramForBadVideo = `
1) If there appears to be a video intro, for example theres one video that transitions into the main content, excluding overlayed text.
2) If the video does not show people (fictional or non-fictional) or has many still frames exluding text.
3) If a you-tube looking pop-up appears.
4) If any of the audio is to extreme, i.e: The talk of death.
`
function getRandomInt(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


function select_vid(): { file_name: string, type: string } {
	const state = getRandomInt(0, 5)
	switch (state) {
		case 0:
			return { file_name: "/mnt/md0/work_station/content_for_system/ITDrama/prod_vids/single_vid_plus_reddit/sho3kd-P2001.mp4", type: "Bad" }
		case 1:
			return { file_name: "/mnt/md0/work_station/content_for_system/tellTale/prod_vids/single_vid_plus_reddit/1837bm4000.mp4", type: "Good" }
		case 2:
			return { file_name: "/mnt/md0/work_station/content_for_system/tellTale/prod_vids/single_vid_plus_reddit/1652hm8000.mp4", type: "Bad" }
		case 3:
			return { file_name: "/mnt/md0/work_station/content_for_system/tellTale/prod_vids/single_vid_plus_reddit/1f2nziz000.mp4", type: "Good" }
		case 4:
			return { file_name: "/mnt/md0/work_station/content_for_system/tellTale/prod_vids/single_vid_plus_reddit/1h2mg3t000.mp4", type: "Bad" }
		case 5:
			return { file_name: "/mnt/md0/work_station/content_for_system/famous.twitch.collection/prod_vids/video_plus_sub/SmokyImpartialChoughTakeNRG-Vd_4OM_q_eTeSUPQ000.mp4", type: "Good" }
	}
	return { file_name: "", type: "null" }
}

export async function main(input: { filePath?: string, invalidParam?: string } = { filePath: "test.mp4", invalidParam: paramForBadVideo }) {
	let res_arr: object[] = []
	let correct_count = 0
	let incorrect_count = 0
	let test_count = 100
	for (let i = 0; i < test_count; i++) {
		const file = select_vid()
		const invalidParam = input.invalidParam ?? paramForBadVideo;
		const uploadResponse = await uploadFile(file.file_name)
		await checkFileState(uploadResponse.file.name)
		const evalRes = (await evalVideo(uploadResponse, invalidParam)).trim()
		if (evalRes == "true") {
			if (file.type == "Good") {
				correct_count++
			} else {
				incorrect_count++
			}
		}
		if (evalRes == "false") {
			if (file.type == "Bad") {
				correct_count++
			} else {
				incorrect_count++
			}
		}
		console.log(evalRes)
		res_arr.push({ res: evalRes, truth: file.type })
	}
	console.log(res_arr)
	console.log(`correct: ${correct_count}, incorrect: ${incorrect_count}`)
	console.log(`Accuracy: ${correct_count / test_count}`)
}
main()



