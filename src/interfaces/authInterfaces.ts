export interface LoginReq {
    email: string;
    password: string;
}

export interface RegisterReq extends LoginReq {
    firstName: string;
    lastName: string;
    accountType: "Candidate" | "Recruiter";
}