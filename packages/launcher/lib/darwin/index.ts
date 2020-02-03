import { findApp } from './util'
import { FoundBrowser, Browser } from '../types'
import * as linuxHelper from '../linux'
import { log } from '../log'
import { merge, partial } from 'ramda'
import { get } from 'lodash'

const detectCanary = partial(findApp, [
  'Contents/MacOS/Google Chrome Canary',
  'com.google.Chrome.canary',
  'KSVersion',
])
const detectChrome = partial(findApp, [
  'Contents/MacOS/Google Chrome',
  'com.google.Chrome',
  'KSVersion',
])
const detectChromium = partial(findApp, [
  'Contents/MacOS/Chromium',
  'org.chromium.Chromium',
  'CFBundleShortVersionString',
])
const detectEdgeCanary = partial(findApp, [
  'Contents/MacOS/Microsoft Edge Canary',
  'com.microsoft.Edge.Canary',
  'CFBundleShortVersionString',
])
const detectEdgeBeta = partial(findApp, [
  'Contents/MacOS/Microsoft Edge Beta',
  'com.microsoft.Edge.Beta',
  'CFBundleShortVersionString',
])
const detectEdgeDev = partial(findApp, [
  'Contents/MacOS/Microsoft Edge Dev',
  'com.microsoft.Edge.Dev',
  'CFBundleShortVersionString',
])
const detectEdge = partial(findApp, [
  'Contents/MacOS/Microsoft Edge',
  'com.microsoft.Edge',
  'CFBundleShortVersionString',
])

type Detectors = {
  [name: string]: {
    [channel: string]: Function
  }
}

const browsers: Detectors = {
  chrome: {
    stable: detectChrome,
    canary: detectCanary,
  },
  chromium: {
    stable: detectChromium,
  },
  edge: {
    stable: detectEdge,
    canary: detectEdgeCanary,
    beta: detectEdgeBeta,
    dev: detectEdgeDev,
  },
}

export function getVersionString (path: string) {
  return linuxHelper.getVersionString(path)
}

export function detect (browser: Browser): Promise<FoundBrowser> {
  let fn = get(browsers, [browser.name, browser.channel])

  if (!fn) {
    // ok, maybe it is custom alias?
    log('detecting custom browser %s on darwin', browser.name)

    return linuxHelper.detect(browser)
  }

  return fn()
  .then(merge({ name: browser.name }))
  .catch(() => {
    log('could not detect %s using traditional Mac methods', browser.name)
    log('trying linux search')

    return linuxHelper.detect(browser)
  })
}
