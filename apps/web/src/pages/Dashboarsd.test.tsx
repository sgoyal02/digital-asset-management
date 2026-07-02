import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import Dashboard from "./Dashboard";
import userEvent from "@testing-library/user-event";

const testReq= vi.fn();
vi.mock("../services/useApiService", () => ({
    useApiService: () => ({
        makeReq:testReq
    })
}));
vi.mock("recharts", () => ({
    ResponsiveContainer:({ children }: any) => <div>{children}</div>,
    BarChart:({ children }: any) => <div>{children}</div>,
    Bar:() => <div />,
    CartesianGrid:() => <div />,
    XAxis:() => <div />,
    YAxis:() => <div />,
    Tooltip:() => <div />
}));

describe('dashboard page-tests', ()=>{
    test("dash title render- test",() => {
        testReq.mockResolvedValue({
            data:{}
        });
        render(<Dashboard/>);
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    //loadin-
    test("shows loading text", () => {
        testReq.mockImplementation(() =>new Promise(() => {}));
        render(<Dashboard/>);
        expect(screen.getByText(/Loading stats/i)).toBeInTheDocument();
    });

    //api-test
    test("shows dashboard stats", async () => {
        testReq
            .mockResolvedValueOnce({data: {
                    totalAssets: 25,expring: 3,dupes: 1,risk: 0,
                    processStatus:{pendingPer:20,failedPer:0}
                }
            })
            .mockResolvedValueOnce({
                data:{data:{calUploads:[]}}
            });
        render(<Dashboard/>);
        expect(await screen.findByText("25")).toBeInTheDocument();
    });

    //upload click-tab
    test("upload 30 days rep-test", async () => {
        testReq            
            .mockResolvedValueOnce({
                data:{totalAssets:10,processStatus:{pendingPer:0,failedPer:0}}
            })
            .mockResolvedValue({
                data:{data:{calUploads:[]}}
            });
        render(<Dashboard/>);
        await userEvent.click(await screen.findByText("30D"));
        expect(testReq).toHaveBeenCalled();
    });

})