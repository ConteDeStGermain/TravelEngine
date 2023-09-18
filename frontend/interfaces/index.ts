// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import { User } from 'path/to/interfaces';

export type User = {
  id: number
  name: string
}

export type Event = {
  id: number;
  city: string;
  country: string;
  type: string;
  rating: string;
  numberofratings: number;
  link: string;
  image: string;
  address: string;
  name: string;
};

export type TransferData = {
  destination: String
  dates: any
  submitted: boolean
}

export type SharedDataContextType = {
  sharedData: TransferData;
  setSharedData: React.Dispatch<React.SetStateAction<TransferData>>;
};
