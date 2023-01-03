export const userEmail = {
  email: {
    type: "string",
    format: "email",
  },
};

export const newUserEmail = {
  newEmail: {
    type: "string",
    format: "newEmail",
  },
};

export const userPassword = {
  password: {
    type: "string",
    format: "password",
  },
};

export const newUserPassword = {
  newPassword: {
    type: "string",
    format: "newPassword",
  },
};

export const userAccountType = {
  accountType: {
    type: "string",
  },
};

export const userFragileProps = {
  ...userPassword,
  ...userAccountType,
};

export const userBasicProps = {
  ...userEmail,
  firstName: {
    type: "string",
  },
  lastName: {
    type: "string",
  },
};

export const userAdditionalProps = {
  avatar: {
    type: "string",
  },
  phoneNumber: {
    type: "string",
  },
  country: {
    type: "string",
  },
  linkedin: {
    type: "string",
  },
};

export const candidateOnlyProps = {
  portfolio: {
    type: "string",
  },
  bio: {
    type: "string",
  },
};

export const recruiterOnlyProps = {
  company: {
    type: "string",
  },
};

export const offerProps = {
  id: {
    type: "string",
  },
  creationDate: {
    type: "string",
  },
  title: {
    type: "string",
  },
  companyName: {
    type: "string",
  },
  location: {
    type: "string",
  },
  experience: {
    type: "string",
  },
  bottomPayrange: {
    type: "number",
  },
  topPayrange: {
    type: "number",
  },
  currency: {
    type: "string",
  },
  description: {
    type: "string",
  },
  status: {
    type: "string",
  },
};

export const experienceCandidate = {
  id: {
    type: "string",
  },
  jobTitle: {
    type: "string",
  },
  company: {
    type: "string",
  },
  country: {
    type: "string",
  },
  from: {
    type: "string",
  },
  to: {
    type: "string",
  },
  details: {
    type: "string",
  },
};

export const educationCandidate = {
  id: {
    type: "string",
  },
  school: {
    type: "string",
  },
  degree: {
    type: "string",
  },
  name: {
    type: "string",
  },
  from: {
    type: "string",
  },
  to: {
    type: "string",
  },
  details: {
    type: "string",
  },
};
