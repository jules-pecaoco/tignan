import { Profile, RescuerProfile } from '../../lib/auth';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Pending: { uid: string };
  SOS: { 
    uid: string; 
    profile: Profile | null; 
    rescuerData?: RescuerProfile | null;
  };
};
