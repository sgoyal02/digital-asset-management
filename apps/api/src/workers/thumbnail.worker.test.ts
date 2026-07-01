import { describe, it, expect, vi, beforeEach } from "vitest";
import { thumbnailWorker } from "./thumbnail.worker";
import { QUEUES } from "../queue/queues";

//setup-
const ack= vi.fn();
const nack= vi.fn();
const consume= vi.fn();
vi.mock("../queue/connection", () => ({
  getChannel: () => ({consume,ack,nack,
    prefetch: vi.fn(),
  }),
}));
vi.mock("../lib/prisma", () => ({
  prisma: {
    asset:{update: vi.fn()}}
}));

vi.mock("../lib/minio", () => ({
  minioClient: {
    bucketExists:vi.fn(() => Promise.resolve(true)),
    makeBucket:vi.fn(),
    getObject:vi.fn(() =>
      Promise.resolve({
        pipe: vi.fn(),
      })
    ),
    putObject: vi.fn(),
  },
}));

vi.mock("../types/helper", () => ({
  jobStart:vi.fn(() => Promise.resolve(1)),
  jobDone:vi.fn(),
  jobFailed:vi.fn(),
  markAssetStatus:vi.fn(),
}));

vi.mock("sharp", () => {
  return {
    default: vi.fn(() => ({
      resize: vi.fn().mockReturnThis(),
      jpeg: vi.fn().mockReturnThis(),
      toBuffer: vi.fn(() => Promise.resolve(Buffer.from("thumb"))),
    })),
  };
});

describe("thumb worker- tests", () => {
  beforeEach(() => {vi.clearAllMocks();});

  it("image thum -processtest", async () => {
    consume.mockImplementation((_queue, cb) => {
      cb({
        content: Buffer.from(
          JSON.stringify({
            assetId: 1,
            fileKey: "test.jpg",
            mimeType: "image/jpeg",
          })
        ),
      });
    });

    await thumbnailWorker();
    expect(consume).toHaveBeenCalledWith(
      QUEUES.THUMBNAIL,
      expect.any(Function)
    );
  });
});