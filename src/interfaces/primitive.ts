export interface Email {
  email: string;
}

export interface AccountType {
  accountType: "Candidate" | "Recruiter";
}

export interface FirstName {
  firstName: string;
}

export interface LastName {
  lastName: string;
}

export interface NewEmail {
  newEmail?: string
}

export interface NewPassword {
  newPassword?: string
}
