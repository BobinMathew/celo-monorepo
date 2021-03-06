import locales from '@celo/mobile/locales'
import hoistStatics from 'hoist-non-react-statics'
import i18n, { LanguageDetectorModule } from 'i18next'
import {
  initReactI18next,
  WithTranslation,
  withTranslation as withTranslationI18Next,
} from 'react-i18next'
import * as RNLocalize from 'react-native-localize'
import { APP_NAME, TOS_LINK } from 'src/config'
import Logger from 'src/utils/Logger'

const TAG = 'i18n'
const TOS_LINK_DISPLAY = TOS_LINK.replace(/^https?\:\/\//i, '')

export enum Namespaces {
  accountScreen10 = 'accountScreen10',
  backupKeyFlow6 = 'backupKeyFlow6',
  exchangeFlow9 = 'exchangeFlow9',
  global = 'global',
  index = 'index',
  inviteFlow11 = 'inviteFlow11',
  goldEducation = 'goldEducation',
  nuxNamePin1 = 'nuxNamePin1',
  nuxVerification2 = 'nuxVerification2',
  receiveFlow8 = 'receiveFlow8',
  sendFlow7 = 'sendFlow7',
  paymentRequestFlow = 'paymentRequestFlow',
  walletFlow5 = 'walletFlow5',
  dappkit = 'dappkit',
  onboarding = 'onboarding',
  fiatExchangeFlow = 'fiatExchangeFlow',
}

function getAvailableResources() {
  const resources = {}
  for (const [key, value] of Object.entries(locales)) {
    Object.defineProperty(resources, key, {
      get: () => value!.strings,
      enumerable: true,
    })
  }
  return resources
}

const availableResources = getAvailableResources()

function getLanguage() {
  // We fallback to `undefined` to know we couldn't find the best language
  // In that case i18n.language will report `undefined` but will use fallbackLng internally
  const fallback = { languageTag: undefined }
  const { languageTag } =
    RNLocalize.findBestAvailableLanguage(Object.keys(availableResources)) || fallback
  return languageTag
}

const languageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  detect: getLanguage,
  init: () => {
    Logger.debug(TAG, 'Initing language detector')
  },
  cacheUserLanguage: (lng: string) => {
    Logger.debug(TAG, `Skipping user language cache ${lng}`)
  },
}

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: {
      default: ['en-US'],
      'es-US': ['es-LA'],
    },
    resources: availableResources,
    ns: ['common', ...Object.keys(Namespaces)],
    defaultNS: 'common',
    // Only enable for debugging as it forces evaluation of all our lazy loaded locales
    // and prints out all strings when initializing
    debug: false,
    interpolation: {
      escapeValue: false,
      defaultVariables: { appName: APP_NAME, tosLink: TOS_LINK_DISPLAY },
    },
  })
  .catch((reason: any) => Logger.error(TAG, 'Failed init i18n', reason))

// Disabling this for now as we have our own language selection within the app
// and this will change the displayed language only for the current session
// when the device locale is changed outside of the app.
// RNLocalize.addEventListener('change', () => {
//   i18n
//     .changeLanguage(getLanguage())
//     .catch((reason: any) => Logger.error(TAG, 'Failed to change i18n language', reason))
// })

// Create HOC wrapper that hoists statics
// https://react.i18next.com/latest/withtranslation-hoc#hoist-non-react-statics
export const withTranslation = <P extends WithTranslation>(namespace: Namespaces) => <
  C extends React.ComponentType<P>
>(
  component: C
) => hoistStatics(withTranslationI18Next(namespace)(component), component)

export default i18n
