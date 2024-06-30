import { Redirect } from 'expo-router';

const index = () => {
    return <Redirect href='authentication/signIn' />;
};

export default index;