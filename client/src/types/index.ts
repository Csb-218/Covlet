export interface cover {
    coverLetter: string
    generating: boolean
}

export interface JD {
    JD: string
    messageBox: HTMLElement
}

export type user = {
    email: string,
    family_name: string,
    given_name: string,
    id: number,
    name: string,
    picture: string,
    verified_email: boolean
}

export interface IProfileSchema {
    personal: {
      name: string;
      email: string;
      phone: string;
      linkedin: string;
    };
    summary: string;
    experience: Array<{
      title: string;
      company: string;
      startDate: Date | string ;
      endDate: Date | string | null;
      responsibilities: string;
      achievements: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      startDate: Date | string;
      endDate: Date | string | null;
      coursework: string;
    }>;
    skills: {
      technical: string[];
      soft: string[];
    };
    certifications: Array<{
      name: string;
      year: string;
    }>;
    languages: string[];
    projects: Array<{
      name: string;
      description: string;
      link?: string;
    }>;
  }


