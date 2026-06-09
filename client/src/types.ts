export interface Related {
  title: string;
  source: string;
  link: string;
}

export interface Post {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceCategory: string;
  sourceHomepage: string;
  snippet: string;
  image: string | null;
  tags: string[];
  isoDate: string;
  readMins: number;
  upvotes: number;
  comments: number;
  score: number;
  type?: string;
  realSignal?: boolean;
  sourceCount?: number;
  clusterSources?: string[];
  related?: Related[];
}

export interface Summary {
  tldr: string;
  why_it_matters: string;
}

export interface TagInfo {
  name: string;
  count: number;
}

export interface SourceInfo {
  name: string;
  homepage: string;
  category: string;
  count: number;
}

export interface TypeInfo {
  name: string;
  count: number;
}

export type SortMode = 'recent' | 'popular' | 'discussed' | 'upvoted';
