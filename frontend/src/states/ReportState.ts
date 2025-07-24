import { create } from 'zustand';
import {models} from "../../wailsjs/go/models";

interface ReportState {
    // report : models.Report | null;
    startReport: (arg0: string | undefined) => Promise<void>;
    // checkReportStatus: (arg0: string | undefined) => Promise<Report>;
    // closedReport: (type: "partial" | "close") => void;
}

// export const useReportState = create<ReportState>((set) => ({
//     report: null,
//     startReport: (username: string | undefined) => {
//         return new Promise(async (resolve, reject) => {
//             try {
//                 // const data = await invoke("start_new_report", { "username": username});
//                 // let report: Report = Report.fromJSON(data);
//                 // console.log("Report TEST", report);
//                 // set({ report: report });
//                 resolve();
//             } catch (error) {
//                 set({ report: null });
//                 reject(error as Error);
//             }
//         });
//     },
//     checkReportStatus: (username: string | undefined) => {
//         return new Promise<Report>(async (resolve, reject) => {
//             try {
//                 // const report = await invoke<Report>("get_active_report", { "username": username});
//                 // set({ report: report });
//                 // resolve(report);
//             } catch (error) {
//                 set({ report: null });
//                 reject(error as Error);
//             }
//         });
//     },
// }));
