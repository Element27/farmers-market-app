
import { getProviders, signIn as SignIntoProvider} from "next-auth/react"
import {
  GlobalContext,
  GlobalDispatchContext,
} from '../../state/context/GlobalContext';
import Header from "../../Components/Header"
import { useContext, useMemo, useState } from 'react';
import useForm from '../../Components/hooks/useForm';
import { auth, db } from '../../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { handlePromise } from '../../utils/handlePromise';
import { toast } from 'react-hot-toast';
import LoadingOverlay from '../../Components/LoadingOverlay';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import useFetchCurrentUser from '../../utils/fetchCurrentUser';


// Browser...
function signIn({ providers }) {

  const [isLoginForm, setIsLoginForm] = useState(false);

  const { isAuthenticated, isOnboarded, user, isLoading } =
    useContext(GlobalContext);

  const { fetchUser } = useFetchCurrentUser();

  const dispatch = useContext(GlobalDispatchContext);
  
  const { form, onChangeHandler, resetForm } = useForm({
    email: '',
    password: '',
  });

  const {
    form: onboardingForm,
    onChangeHandler: onboardingFormOnChangeHandler,
  } = useForm({
    username: '',
    fullName: '',
  });

  const authenticate = async () => {
    if (isLoginForm) {
      const [data, loginError] = await handlePromise(
        signInWithEmailAndPassword(auth, form.email, form.password)
      );
      return loginError;
    } else {
      const [data, signupError] = await handlePromise(
        createUserWithEmailAndPassword(auth, form.email, form.password)
      );
      return signupError;
    }
  };

  const setUserData = async () => {
    try {
      const userCollection = collection(db, 'users');

      const userQuery = query(
        userCollection,
        where('username', '==', onboardingForm.username)
      );

      const usersSnapshot = await getDocs(userQuery);

      if (usersSnapshot.docs.length > 0) {
        toast.error('username already exists');
        return;
      }

      await setDoc(doc(db, 'users', auth.currentUser.email), {
        fullName: onboardingForm.fullName,
        username: onboardingForm.username,
        email: auth.currentUser.email,
        id: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      toast.success('welcome to the farmers market app');

      dispatch({
        type: 'SET_IS_ONBOARDED',
        payload: {
          isOnboarded: true,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    dispatch({
      type: 'SET_LOADING',
      payload: {
        isLoading: true,
      },
    });

    let error = null;

    error = await authenticate();

    // await fetchUser();
    // check if the user data exists in the db
    const userData = await fetchUser();

    if (userData) {
      dispatch({
        type: 'SET_USER',
        payload: {
          user: userData,
        },
      });
      dispatch({
        type: 'SET_IS_ONBOARDED',
        payload: {
          isOnboarded: true,
        },
      });
    }

    dispatch({
      type: 'SET_LOADING',
      payload: {
        isLoading: false,
      },
    });

    if (error) toast.error(error.message);
    if (!error)
      toast.success(
        `you have successfully ${isLoginForm ? 'logged in' : 'signed up'}`
      );
    resetForm();
  };

  const isDisabled = useMemo(() => {
    return !Object.values(form).every((val) => !!val);
  }, [form]);

  const onboardingSubmitHandler = async (e) => {
    e.preventDefault();
    dispatch({
      type: 'SET_LOADING',
      payload: {
        isLoading: true,
      },
    });
    await setUserData();
    dispatch({
      type: 'SET_LOADING',
      payload: {
        isLoading: false,
      },
    });
  };

  return (
    
    <>
        <Header />
        <div className='flex flex-col items-center justify-center min-h-screen py-6-mt-56 px-14 text-center'>
        <div>

            <h1 className='font-lg italic bg-green-700'>THE FARMERS MARKET</h1>
           <p className="font-xs italic"> Welcome to the Farmers market where farmers and consumers interact on a daily basis</p>

        <div className='mt-40'>
        {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button className='p-3 bg-green-500 rounded-lg text-white' onClick={() => SignIntoProvider(provider.id, { callbackUrl: '/'})}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
        </div>
        </div>

        <div className="flex items-center justify-center w-full my-5 space-x-2">
              <div className="h-[0.8px] w-full bg-slate-400" />
              <div className="text-sm font-semibold text-center text-red-900">
                OR
              </div>
              <div className="h-[0.8px] w-full bg-slate-400" />
            </div>

            
            {!isAuthenticated && (
              <form
                onSubmit={submitHandler}
                className="flex flex-col items-center space-y-5"
              >
             
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={onChangeHandler}
                  value={form.email}
                  className="w-full px-2 py-1 bg-gray-100 border rounded-sm outline-none hover:bg-transparent focus:bg-transparent placeholder:text-sm focus:border-gray-400"
                  placeholder="Email"
                />
                <input
                  type="password"
                  name="password"
                  id="password"
                  onChange={onChangeHandler}
                  value={form.password}
                  placeholder="Password"
                  className="w-full px-2 py-1 transition bg-gray-100 border rounded-sm outline-none hover:bg-transparent focus:bg-transparent placeholder:text-sm focus:border-gray-400"
                />
                <button
                  type="submit"
                  className="bg-[#006400] py-1 text-white active:scale-95 transform transition w-full disabled:bg-opacity-50 disabled:scale-100 rounded-lg text-sm font-semibold"
                  disabled={isDisabled}
                >
                  {isLoginForm ? 'Log In' : 'Sign Up'}
                </button>
              </form>
            )}

            {isAuthenticated && !isOnboarded && (
              <form
                onSubmit={onboardingSubmitHandler}
                className="flex flex-col items-center space-y-5"
              >
                
                <input
                  type="username"
                  name="username"
                  id="username"
                  onChange={onboardingFormOnChangeHandler}
                  value={onboardingForm.username}
                  className="w-full px-2 py-1 bg-gray-100 border rounded-sm outline-none hover:bg-transparent focus:bg-transparent placeholder:text-sm focus:border-gray-400"
                  placeholder="username"
                />
                <input
                  type="fullName"
                  name="fullName"
                  id="fullName"
                  onChange={onboardingFormOnChangeHandler}
                  value={onboardingForm.fullName}
                  placeholder="Your Full Name"
                  className="w-full px-2 py-1 transition bg-gray-100 border rounded-sm outline-none hover:bg-transparent focus:bg-transparent placeholder:text-sm focus:border-gray-400"
                />
                <button
                  type="submit"
                  className="bg-[#006400] py-1 text-white active:scale-95 transform transition w-full disabled:bg-opacity-50 disabled:scale-100 rounded text-sm font-semibold"
                  disabled={
                    !onboardingForm.username || !onboardingForm.fullName
                  }
                >
                  Submit
                </button>
              </form>
            )}

            {isLoginForm && (
              <div className="w-full text-xs text-center text-indigo-900">
                Forgotten your password?
              </div>
            )}
          
          <div className="w-full py-5 mt-4 space-y-5 text-sm text-center bg-white border border-gray-300">
            {isLoginForm
              ? "Don't have an account?"
              : 'Already have an account?'}
            <button
              onClick={() => setIsLoginForm((prev) => !prev)}
              className="ml-2 font-semibold text-green-600"
            >
              {isLoginForm ? 'Sign Up' : 'Login'}
            </button>
          </div>
        
      
    
          </div>
    
    </>
    
  )
}

//Server
export async function getServerSideProps() {

    const providers = await getProviders();

    return {
        props: {
            providers
        }
    }

}

export default signIn