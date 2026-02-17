export type RequestStatus = "pending" | "accepted" | "rejected";

export interface Request {
	id: string;
	email: string;
	status: RequestStatus;
	createdAt: Date;
}
