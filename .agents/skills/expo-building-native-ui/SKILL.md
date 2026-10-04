Expo UI Guidelines

References

Consult these resources as needed:

references/
  animations.md          Reanimated: entering, exiting, layout, scroll-driven, gestures
  controls.md            Native iOS: Switch, Slider, SegmentedControl, DateTimePicker, Picker
  form-sheet.md          Form sheets in expo-router: configuration, footers and background interaction. 
  gradients.md           CSS gradients via experimental_backgroundImage (New Arch only)
  icons.md               SF Symbols via expo-image (sf: source), names, animations, weights
  media.md               Camera, audio, video, and file saving
  route-structure.md     Route conventions, dynamic routes, groups, folder organization
  search.md              Search bar with headers, useSearch hook, filtering patterns
  storage.md             SQLite, AsyncStorage, SecureStore
  tabs.md                NativeTabs, migration from JS tabs, iOS 26 features
  toolbar-and-headers.md Stack headers and toolbar buttons, menus, search (iOS only)
  visual-effects.md      Blur (expo-blur) and liquid glass (expo-glass-effect)
  webgpu-three.md        3D graphics, games, GPU visualizations with WebGPU and Three.js
  zoom-transitions.md    Apple Zoom: fluid zoom transitions with Link.AppleZoom (iOS 18+)

Running the App

CRITICAL: Always try Expo Go first before creating custom builds.

Most Expo apps work in Expo Go without any custom native code. Before running npx expo run:ios or npx expo run:android:

Start with Expo Go: Run npx expo start and scan the QR code with Expo Go

Check if features work: Test your app thoroughly in Expo Go

Only create custom builds when required - see below

When Custom Builds Are Required

You need npx expo run:ios/android or eas build ONLY when using:

Local Expo modules (custom native code in modules/)

Apple targets (widgets, app clips, extensions via @bacons/apple-targets)

Third-party native modules not included in Expo Go

Custom native configuration that can't be expressed in app.json

When Expo Go Works

Expo Go supports a huge range of features out of the box:

All expo-* packages (camera, location, notifications, etc.)

Expo Router navigation

Most UI libraries (reanimated, gesture handler, etc.)

Push notifications, deep links, and more

If you're unsure, try Expo Go first. Creating custom builds adds complexity, slower iteration, and requires Xcode/Android Studio setup.

Code Style

Be cautious of unterminated strings. Ensure nested backticks are escaped; never forget to escape quotes correctly.

Always use import statements at the top of the file.

Always use kebab-case for file names, e.g. comment-card.tsx

Always remove old route files when moving or restructuring navigation

Never use special characters in file names

Configure tsconfig.json with path aliases, and prefer aliases over relative imports for refactors.

Routes

See ./references/route-structure.md for detailed route conventions.

Routes belong in the app directory.

Never co-locate components, types, or utilities in the app directory. This is an anti-pattern.

Ensure the app always has a route that matches "/", it may be inside a group route.

Library Preferences

Never use modules removed from React Native such as Picker, WebView, SafeAreaView, or AsyncStorage

Never use legacy expo-permissions

expo-audio not expo-av

expo-video not expo-av

expo-image with source="sf:name" for SF Symbols, not expo-symbols or @expo/vector-icons

react-native-safe-area-context not react-native SafeAreaView

process.env.EXPO_OS not Platform.OS

React.use not React.useContext

expo-image Image component instead of intrinsic element img

expo-glass-effect for liquid glass backdrops

Responsiveness

Always wrap root component in a scroll view for responsiveness

Use &#x3C;ScrollView contentInsetAdjustmentBehavior="automatic" /> instead of &#x3C;SafeAreaView> for smarter safe area insets

contentInsetAdjustmentBehavior="automatic" should be applied to FlatList and SectionList as well

Use flexbox instead of Dimensions API

ALWAYS prefer useWindowDimensions over Dimensions.get() to measure screen size

Behavior

Use expo-haptics conditionally on iOS to make more delightful experiences

Use views with built-in haptics like &#x3C;Switch /> from React Native and @react-native-community/datetimepicker

When a route belongs to a Stack, its first child should almost always be a ScrollView with contentInsetAdjustmentBehavior="automatic" set

When adding a ScrollView to the page it should almost always be the first component inside the route component

Prefer headerSearchBarOptions in Stack.Screen options to add a search bar

Use the &#x3C;Text selectable /> prop on text containing data that could be copied

Consider formatting large numbers like 1.4M or 38k

Never use intrinsic elements like 'img' or 'div' unless in a webview or Expo DOM component

Styling

Follow Apple Human Interface Guidelines.

General Styling Rules

Prefer flex gap over margin and padding styles

Prefer padding over margin where possible

Always account for safe area, either with stack headers, tabs, or ScrollView/FlatList contentInsetAdjustmentBehavior="automatic"

Ensure both top and bottom safe area insets are accounted for

Inline styles not StyleSheet.create unless reusing styles is faster

Add entering and exiting animations for state changes

Use { borderCurve: 'continuous' } for rounded corners unless creating a capsule shape

ALWAYS use a navigation stack title instead of a custom text element on the page

When padding a ScrollView, use contentContainerStyle padding and gap instead of padding on the ScrollView itself (reduces clipping)

CSS and Tailwind are not supported - use inline styles

Text Styling

Add the selectable prop to every &#x3C;Text/> element displaying important data or error messages

Counters should use { fontVariant: 'tabular-nums' } for alignment

Shadows

Use CSS boxShadow style prop. NEVER use legacy React Native shadow or elevation styles.

&#x3C;View style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }} />

'inset' shadows are supported.

Navigation

Link

Use &#x3C;Link href="/path" /> from 'expo-router' for navigation between routes.

import { Link } from 'expo-router';

// Basic link
&#x3C;Link href="/path" />

// Wrapping custom components
&#x3C;Link href="/path" asChild>
  &#x3C;Pressable>...&#x3C;/Pressable>
&#x3C;/Link>

Whenever possible, include a &#x3C;Link.Preview> to follow iOS conventions. Add context menus and previews frequently to enhance navigation.

Stack

ALWAYS use _layout.tsx files to define stacks

Use Stack from 'expo-router/stack' for native navigation stacks

Page Title

Set the page title in Stack.Screen options:

&#x3C;Stack.Screen options={{ title: "Home" }} />

Context Menus

Add long press context menus to Link components:

import { Link } from "expo-router";

&#x3C;Link href="/settings" asChild>
  &#x3C;Link.Trigger>
    &#x3C;Pressable>
      &#x3C;Card />
    &#x3C;/Pressable>
  &#x3C;/Link.Trigger>
  &#x3C;Link.Menu>
    &#x3C;Link.MenuAction
      title="Share"
      icon="square.and.arrow.up"
      onPress={handleSharePress}
    />
    &#x3C;Link.MenuAction
      title="Block"
      icon="nosign"
      destructive
      onPress={handleBlockPress}
    />
    &#x3C;Link.Menu title="More" icon="ellipsis">
      &#x3C;Link.MenuAction title="Copy" icon="doc.on.doc" onPress={() => {}} />
      &#x3C;Link.MenuAction
        title="Delete"
        icon="trash"
        destructive
        onPress={() => {}}
      />
    &#x3C;/Link.Menu>
  &#x3C;/Link.Menu>
&#x3C;/Link>;

Link Previews

Use link previews frequently to enhance navigation:

&#x3C;Link href="/settings">
  &#x3C;Link.Trigger>
    &#x3C;Pressable>
      &#x3C;Card />Expo UI Guidelines

References

Consult these resources as needed:

references/
  animations.md          Reanimated: entering, exiting, layout, scroll-driven, gestures
  controls.md            Native iOS: Switch, Slider, SegmentedControl, DateTimePicker, Picker
  form-sheet.md          Form sheets in expo-router: configuration, footers and background interaction. 
  gradients.md           CSS gradients via experimental_backgroundImage (New Arch only)
  icons.md               SF Symbols via expo-image (sf: source), names, animations, weights
  media.md               Camera, audio, video, and file saving
  route-structure.md     Route conventions, dynamic routes, groups, folder organization
  search.md              Search bar with headers, useSearch hook, filtering patterns
  storage.md             SQLite, AsyncStorage, SecureStore
  tabs.md                NativeTabs, migration from JS tabs, iOS 26 features
  toolbar-and-headers.md Stack headers and toolbar buttons, menus, search (iOS only)
  visual-effects.md      Blur (expo-blur) and liquid glass (expo-glass-effect)
  webgpu-three.md        3D graphics, games, GPU visualizations with WebGPU and Three.js
  zoom-transitions.md    Apple Zoom: fluid zoom transitions with Link.AppleZoom (iOS 18+)

Running the App

CRITICAL: Always try Expo Go first before creating custom builds.

Most Expo apps work in Expo Go without any custom native code. Before running npx expo run:ios or npx expo run:android:

Start with Expo Go: Run npx expo start and scan the QR code with Expo Go

Check if features work: Test your app thoroughly in Expo Go

Only create custom builds when required - see below

When Custom Builds Are Required

You need npx expo run:ios/android or eas build ONLY when using:

Local Expo modules (custom native code in modules/)

Apple targets (widgets, app clips, extensions via @bacons/apple-targets)

Third-party native modules not included in Expo Go

Custom native configuration that can't be expressed in app.json

When Expo Go Works

Expo Go supports a huge range of features out of the box:

All expo-* packages (camera, location, notifications, etc.)

Expo Router navigation

Most UI libraries (reanimated, gesture handler, etc.)

Push notifications, deep links, and more

If you're unsure, try Expo Go first. Creating custom builds adds complexity, slower iteration, and requires Xcode/Android Studio setup.

Code Style

Be cautious of unterminated strings. Ensure nested backticks are escaped; never forget to escape quotes correctly.

Always use import statements at the top of the file.

Always use kebab-case for file names, e.g. comment-card.tsx

Always remove old route files when moving or restructuring navigation

Never use special characters in file names

Configure tsconfig.json with path aliases, and prefer aliases over relative imports for refactors.

Routes

See ./references/route-structure.md for detailed route conventions.

Routes belong in the app directory.

Never co-locate components, types, or utilities in the app directory. This is an anti-pattern.

Ensure the app always has a route that matches "/", it may be inside a group route.

Library Preferences

Never use modules removed from React Native such as Picker, WebView, SafeAreaView, or AsyncStorage

Never use legacy expo-permissions

expo-audio not expo-av

expo-video not expo-av

expo-image with source="sf:name" for SF Symbols, not expo-symbols or @expo/vector-icons

react-native-safe-area-context not react-native SafeAreaView

process.env.EXPO_OS not Platform.OS

React.use not React.useContext

expo-image Image component instead of intrinsic element img

expo-glass-effect for liquid glass backdrops

Responsiveness

Always wrap root component in a scroll view for responsiveness

Use &#x3C;ScrollView contentInsetAdjustmentBehavior="automatic" /> instead of &#x3C;SafeAreaView> for smarter safe area insets

contentInsetAdjustmentBehavior="automatic" should be applied to FlatList and SectionList as well

Use flexbox instead of Dimensions API

ALWAYS prefer useWindowDimensions over Dimensions.get() to measure screen size

Behavior

Use expo-haptics conditionally on iOS to make more delightful experiences

Use views with built-in haptics like &#x3C;Switch /> from React Native and @react-native-community/datetimepicker

When a route belongs to a Stack, its first child should almost always be a ScrollView with contentInsetAdjustmentBehavior="automatic" set

When adding a ScrollView to the page it should almost always be the first component inside the route component

Prefer headerSearchBarOptions in Stack.Screen options to add a search bar

Use the &#x3C;Text selectable /> prop on text containing data that could be copied

Consider formatting large numbers like 1.4M or 38k

Never use intrinsic elements like 'img' or 'div' unless in a webview or Expo DOM component

Styling

Follow Apple Human Interface Guidelines.

General Styling Rules

Prefer flex gap over margin and padding styles

Prefer padding over margin where possible

Always account for safe area, either with stack headers, tabs, or ScrollView/FlatList contentInsetAdjustmentBehavior="automatic"

Ensure both top and bottom safe area insets are accounted for

Inline styles not StyleSheet.create unless reusing styles is faster

Add entering and exiting animations for state changes

Use { borderCurve: 'continuous' } for rounded corners unless creating a capsule shape

ALWAYS use a navigation stack title instead of a custom text element on the page

When padding a ScrollView, use contentContainerStyle padding and gap instead of padding on the ScrollView itself (reduces clipping)

CSS and Tailwind are not supported - use inline styles

Text Styling

Add the selectable prop to every &#x3C;Text/> element displaying important data or error messages

Counters should use { fontVariant: 'tabular-nums' } for alignment

Shadows

Use CSS boxShadow style prop. NEVER use legacy React Native shadow or elevation styles.

&#x3C;View style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }} />

'inset' shadows are supported.

Navigation

Link

Use &#x3C;Link href="/path" /> from 'expo-router' for navigation between routes.

import { Link } from 'expo-router';

// Basic link
&#x3C;Link href="/path" />

// Wrapping custom components
&#x3C;Link href="/path" asChild>
  &#x3C;Pressable>...&#x3C;/Pressable>
&#x3C;/Link>

Whenever possible, include a &#x3C;Link.Preview> to follow iOS conventions. Add context menus and previews frequently to enhance navigation.

Stack

ALWAYS use _layout.tsx files to define stacks

Use Stack from 'expo-router/stack' for native navigation stacks

Page Title

Set the page title in Stack.Screen options:

&#x3C;Stack.Screen options={{ title: "Home" }} />

Context Menus

Add long press context menus to Link components:

import { Link } from "expo-router";

&#x3C;Link href="/settings" asChild>
  &#x3C;Link.Trigger>
    &#x3C;Pressable>
      &#x3C;Card />
    &#x3C;/Pressable>
  &#x3C;/Link.Trigger>
  &#x3C;Link.Menu>
    &#x3C;Link.MenuAction
      title="Share"
      icon="square.and.arrow.up"
      onPress={handleSharePress}
    />
    &#x3C;Link.MenuAction
      title="Block"
      icon="nosign"
      destructive
      onPress={handleBlockPress}
    />
    &#x3C;Link.Menu title="More" icon="ellipsis">
      &#x3C;Link.MenuAction title="Copy" icon="doc.on.doc" onPress={() => {}} />
      &#x3C;Link.MenuAction
        title="Delete"
        icon="trash"
        destructive
        onPress={() => {}}
      />
    &#x3C;/Link.Menu>
  &#x3C;/Link.Menu>
&#x3C;/Link>;

Link Previews

Use link previews frequently to enhance navigation:

&#x3C;Link href="/settings">
  &#x3C;Link.Trigger>
    &#x3C;Pressable>
      &#x3C;Card />
