import { YStack, useToastController } from '@cai/ui'
import { capitalizeWord } from '@cai/ui/src/libs/string'
import { SignUpSignInComponent } from 'app/features/sign-in/SignUpSignIn'
import { signIn } from 'app/utils/auth/client'
import { getInitialURL } from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { useRouter } from 'solito/router'

type OAuthProvider = 'google' | 'github'

export const SignInScreen = (): React.ReactNode => {
  const { replace } = useRouter()
  const toast = useToastController()

  const handleOAuthSignInWithPress = async (provider: OAuthProvider) => {
    try {
      const redirectUri = (await getInitialURL()) || 'cai://'
      
      // Open OAuth flow in browser
      const response = await WebBrowser.openAuthSessionAsync(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/${provider}?redirect=${encodeURIComponent(redirectUri)}`,
        redirectUri
      )
      
      if (response.type === 'success') {
        // The auth flow completed successfully
        replace('/')
      }
    } catch (error) {
      toast.show(`${capitalizeWord(provider)} sign in failed`, {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
      console.log('OAuth Sign in failed', error)
    } finally {
      WebBrowser.maybeCompleteAuthSession()
    }
  }

  const handleEmailSignInWithPress = async (email: string, password: string) => {
    try {
      const { error } = await signIn.email({
        email,
        password,
      })
      
      if (error) {
        toast.show('Sign in failed', {
          description: error.message,
        })
        return
      }

      replace('/')
    } catch (error) {
      toast.show('Sign in failed', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
    }
  }

  return (
    <YStack flex={1} justifyContent='center' alignItems='center' space>
      <SignUpSignInComponent
        type='sign-in'
        handleOAuthWithPress={handleOAuthSignInWithPress}
        handleEmailWithPress={handleEmailSignInWithPress}
      />
    </YStack>
  )
}
