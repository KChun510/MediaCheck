import * as dotenv from 'dotenv';
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();
const apiKey = process.env.gemAPIKey || "";
const fileManager = new GoogleAIFileManager(apiKey);
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
	model: "gemini-1.5-pro",
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
		await new Promise((resolve) => setTimeout(resolve, 5_000))
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

	const prompt2 = `Your job is to decide if a parameter was broken based on this text: 
	${videoAnalysisRes}.
	Only respond with a single word, If any parameter is broken return "false" , else return "true". 
	`

	const conclusionFromAnalysis = (await model.generateContent(prompt2)).response.text()

	return conclusionFromAnalysis

}

const paramForBadVideo = `
1) If anypop-up or add appears.
2) If visual gameplay is not fast-paced combat or intense physical movement, then the parameters are violated.
3) If any of the audio is to extreme, i.e: The talk of death.
`

export async function main(input: { filePath?: string, invalidParam?: string } = { filePath: "test.mp4", invalidParam: paramForBadVideo }) {

	const invalidParam = input.invalidParam ?? paramForBadVideo;
	const uploadResponse = await uploadFile(input.filePath ?? "")
	await checkFileState(uploadResponse.file.name)
	console.log(await evalVideo(uploadResponse, invalidParam))
}
const itDramaBad = "/mnt/md0/work_station/content_for_system/ITDrama/prod_vids/single_vid_plus_reddit/sho3kd-P2001.mp4"
const tellTaleBad = "/mnt/md0/work_station/content_for_system/tellTale/prod_vids/single_vid_plus_reddit/1652hm8000.mp4"

main({ filePath: itDramaBad })



