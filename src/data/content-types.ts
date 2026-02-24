export type ProjectImageManifest = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type ProjectManifest = {
  slug: string;
  title: string;
  description: string;
  categories: string[];
  coverImage: ProjectImageManifest | null;
  images: ProjectImageManifest[];
};

export type PressManifest = {
  outlet: string;
  title: string;
  url: string;
};

export type WorkspaceContent = {
  site: {
    name: string;
    shortName: string;
    tagline: string;
    instagramUrl: string;
    blogUrl: string;
  };
  about: {
    title: string;
    paragraphs: string[];
    image: ProjectImageManifest;
  };
  contact: {
    title: string;
    paragraphs: string[];
    image: ProjectImageManifest;
  };
  press: PressManifest[];
  categories: string[];
  projectOrder: string[];
  featuredProjectSlugs: string[];
};

export type EditorStateResponse = {
  workspace: WorkspaceContent;
  projects: ProjectManifest[];
};
