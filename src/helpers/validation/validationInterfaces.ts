export const userEmail = {
  email: {
    type: "string",
  },
};

export const userPassword = {
  password: {
    type: "string",
  },
};

export const userNewPassword = {
  newPassword: {
    type: "string",
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
    type: "number",
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
