
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T extends DefineComponent> = T & DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>>
type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = (T & DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }>)
interface _GlobalComponents {
      'ChartsDonut': typeof import("../app/components/Charts/Donut.vue")['default']
    'ChartsMarketApexKlinesChart': typeof import("../app/components/Charts/MarketApexKlinesChart.vue")['default']
    'ChartsSparkline': typeof import("../app/components/Charts/Sparkline.vue")['default']
    'ChartsTvAdvancedChart': typeof import("../app/components/Charts/TvAdvancedChart.client.vue")['default']
    'DashboardBreadthBar': typeof import("../app/components/Dashboard/BreadthBar.vue")['default']
    'DashboardDonutBreadth': typeof import("../app/components/Dashboard/DonutBreadth.vue")['default']
    'DashboardDonutDominance': typeof import("../app/components/Dashboard/DonutDominance.vue")['default']
    'DashboardDonutQuoteBreakdown': typeof import("../app/components/Dashboard/DonutQuoteBreakdown.vue")['default']
    'DashboardGainers': typeof import("../app/components/Dashboard/Gainers.vue")['default']
    'DashboardHeatmap': typeof import("../app/components/Dashboard/Heatmap.vue")['default']
    'DashboardKpiGrid': typeof import("../app/components/Dashboard/KpiGrid.vue")['default']
    'DashboardLiquidity': typeof import("../app/components/Dashboard/Liquidity.vue")['default']
    'DashboardLosers': typeof import("../app/components/Dashboard/Losers.vue")['default']
    'DashboardQuoteBreakdown': typeof import("../app/components/Dashboard/QuoteBreakdown.vue")['default']
    'DashboardStatCardLink': typeof import("../app/components/Dashboard/StatCardLink.vue")['default']
    'DashboardTopList': typeof import("../app/components/Dashboard/TopList.vue")['default']
    'DashboardVolatility': typeof import("../app/components/Dashboard/Volatility.vue")['default']
    'DashboardVolumeLeaders': typeof import("../app/components/Dashboard/VolumeLeaders.vue")['default']
    'DashboardVolumeSurge': typeof import("../app/components/Dashboard/VolumeSurge.vue")['default']
    'DashboardWatchlistMini': typeof import("../app/components/Dashboard/WatchlistMini.vue")['default']
    'MarketAssetDetailPanel': typeof import("../app/components/Market/AssetDetailPanel.vue")['default']
    'MarketAssetOverview': typeof import("../app/components/Market/AssetOverview.vue")['default']
    'MarketLiveToggle': typeof import("../app/components/Market/LiveToggle.vue")['default']
    'MarketBidAsk': typeof import("../app/components/Market/MarketBidAsk.vue")['default']
    'MarketCategoryBar': typeof import("../app/components/Market/MarketCategoryBar.vue")['default']
    'MarketCommunity': typeof import("../app/components/Market/MarketCommunity.vue")['default']
    'MarketDepthChart': typeof import("../app/components/Market/MarketDepthChart.vue")['default']
    'MarketHighlights': typeof import("../app/components/Market/MarketHighlights.vue")['default']
    'MarketHighlightsCard': typeof import("../app/components/Market/MarketHighlightsCard.vue")['default']
    'MarketHighlightsRow': typeof import("../app/components/Market/MarketHighlightsRow.vue")['default']
    'MarketOrderBook': typeof import("../app/components/Market/MarketOrderBook.vue")['default']
    'MarketPairsForBase': typeof import("../app/components/Market/MarketPairsForBase.vue")['default']
    'MarketPerformanceChips': typeof import("../app/components/Market/MarketPerformanceChips.vue")['default']
    'MarketRecentTrades': typeof import("../app/components/Market/MarketRecentTrades.vue")['default']
    'MarketTable': typeof import("../app/components/Market/MarketTable.vue")['default']
    'MarketTablePro': typeof import("../app/components/Market/MarketTablePro.vue")['default']
    'MarketTickerStats': typeof import("../app/components/Market/MarketTickerStats.vue")['default']
    'MarketVolumeSplit': typeof import("../app/components/Market/MarketVolumeSplit.vue")['default']
    'MarketWhaleTrades': typeof import("../app/components/Market/MarketWhaleTrades.vue")['default']
    'MarketPagination': typeof import("../app/components/Market/Pagination.vue")['default']
    'MarketStatCard': typeof import("../app/components/Market/StatCard.vue")['default']
    'MarketTickerCard': typeof import("../app/components/Market/TickerCard.vue")['default']
    'MarketTopGainers': typeof import("../app/components/Market/TopGainers.vue")['default']
    'MarketWatchlistToggle': typeof import("../app/components/Market/WatchlistToggle.vue")['default']
    'NewsHighlights': typeof import("../app/components/news/NewsHighlights.vue")['default']
    'NewsStats': typeof import("../app/components/news/NewsStats.vue")['default']
    'UiCoinLogo': typeof import("../app/components/ui/CoinLogo.vue")['default']
    'UiRowSkeleton': typeof import("../app/components/ui/RowSkeleton.vue")['default']
    'UiSkeletonBlock': typeof import("../app/components/ui/SkeletonBlock.vue")['default']
    'UiSkeletonLine': typeof import("../app/components/ui/SkeletonLine.vue")['default']
    'UAccordion': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Accordion.vue")['default']
    'UAlert': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Alert.vue")['default']
    'UApp': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/App.vue")['default']
    'UAvatar': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Avatar.vue")['default']
    'UAvatarGroup': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/AvatarGroup.vue")['default']
    'UBadge': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Badge.vue")['default']
    'UBreadcrumb': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Breadcrumb.vue")['default']
    'UButton': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Button.vue")['default']
    'UButtonGroup': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ButtonGroup.vue")['default']
    'UCalendar': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Calendar.vue")['default']
    'UCard': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Card.vue")['default']
    'UCarousel': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Carousel.vue")['default']
    'UCheckbox': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Checkbox.vue")['default']
    'UCheckboxGroup': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/CheckboxGroup.vue")['default']
    'UChip': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Chip.vue")['default']
    'UCollapsible': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Collapsible.vue")['default']
    'UColorPicker': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ColorPicker.vue")['default']
    'UCommandPalette': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/CommandPalette.vue")['default']
    'UContainer': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Container.vue")['default']
    'UContextMenu': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ContextMenu.vue")['default']
    'UContextMenuContent': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ContextMenuContent.vue")['default']
    'UDrawer': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Drawer.vue")['default']
    'UDropdownMenu': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/DropdownMenu.vue")['default']
    'UDropdownMenuContent': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/DropdownMenuContent.vue")['default']
    'UFileUpload': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/FileUpload.vue")['default']
    'UForm': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Form.vue")['default']
    'UFormField': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/FormField.vue")['default']
    'UIcon': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Icon.vue")['default']
    'UInput': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Input.vue")['default']
    'UInputMenu': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/InputMenu.vue")['default']
    'UInputNumber': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/InputNumber.vue")['default']
    'UInputTags': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/InputTags.vue")['default']
    'UKbd': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Kbd.vue")['default']
    'ULink': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Link.vue")['default']
    'ULinkBase': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/LinkBase.vue")['default']
    'UModal': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Modal.vue")['default']
    'UNavigationMenu': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/NavigationMenu.vue")['default']
    'UOverlayProvider': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/OverlayProvider.vue")['default']
    'UPagination': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Pagination.vue")['default']
    'UPinInput': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/PinInput.vue")['default']
    'UPopover': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Popover.vue")['default']
    'UProgress': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Progress.vue")['default']
    'URadioGroup': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/RadioGroup.vue")['default']
    'USelect': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Select.vue")['default']
    'USelectMenu': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/SelectMenu.vue")['default']
    'USeparator': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Separator.vue")['default']
    'USkeleton': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Skeleton.vue")['default']
    'USlideover': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Slideover.vue")['default']
    'USlider': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Slider.vue")['default']
    'UStepper': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Stepper.vue")['default']
    'USwitch': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Switch.vue")['default']
    'UTable': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Table.vue")['default']
    'UTabs': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Tabs.vue")['default']
    'UTextarea': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Textarea.vue")['default']
    'UTimeline': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Timeline.vue")['default']
    'UToast': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Toast.vue")['default']
    'UToaster': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Toaster.vue")['default']
    'UTooltip': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Tooltip.vue")['default']
    'UTree': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Tree.vue")['default']
    'NuxtWelcome': typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
    'NuxtLayout': typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
    'NuxtErrorBoundary': typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
    'ClientOnly': typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
    'DevOnly': typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
    'ServerPlaceholder': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtLink': typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
    'NuxtLoadingIndicator': typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
    'NuxtTime': typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
    'NuxtImg': typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']
    'NuxtPicture': typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']
    'Icon': typeof import("../node_modules/@nuxt/icon/dist/runtime/components/index")['default']
    'ColorScheme': typeof import("../node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']
    'NuxtPage': typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
    'NoScript': typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
    'Link': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
    'Base': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
    'Title': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
    'Meta': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
    'Style': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
    'Head': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
    'Html': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
    'Body': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
    'NuxtIsland': typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
    'ChartsTvAdvancedChart': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
      'LazyChartsDonut': LazyComponent<typeof import("../app/components/Charts/Donut.vue")['default']>
    'LazyChartsMarketApexKlinesChart': LazyComponent<typeof import("../app/components/Charts/MarketApexKlinesChart.vue")['default']>
    'LazyChartsSparkline': LazyComponent<typeof import("../app/components/Charts/Sparkline.vue")['default']>
    'LazyChartsTvAdvancedChart': LazyComponent<typeof import("../app/components/Charts/TvAdvancedChart.client.vue")['default']>
    'LazyDashboardBreadthBar': LazyComponent<typeof import("../app/components/Dashboard/BreadthBar.vue")['default']>
    'LazyDashboardDonutBreadth': LazyComponent<typeof import("../app/components/Dashboard/DonutBreadth.vue")['default']>
    'LazyDashboardDonutDominance': LazyComponent<typeof import("../app/components/Dashboard/DonutDominance.vue")['default']>
    'LazyDashboardDonutQuoteBreakdown': LazyComponent<typeof import("../app/components/Dashboard/DonutQuoteBreakdown.vue")['default']>
    'LazyDashboardGainers': LazyComponent<typeof import("../app/components/Dashboard/Gainers.vue")['default']>
    'LazyDashboardHeatmap': LazyComponent<typeof import("../app/components/Dashboard/Heatmap.vue")['default']>
    'LazyDashboardKpiGrid': LazyComponent<typeof import("../app/components/Dashboard/KpiGrid.vue")['default']>
    'LazyDashboardLiquidity': LazyComponent<typeof import("../app/components/Dashboard/Liquidity.vue")['default']>
    'LazyDashboardLosers': LazyComponent<typeof import("../app/components/Dashboard/Losers.vue")['default']>
    'LazyDashboardQuoteBreakdown': LazyComponent<typeof import("../app/components/Dashboard/QuoteBreakdown.vue")['default']>
    'LazyDashboardStatCardLink': LazyComponent<typeof import("../app/components/Dashboard/StatCardLink.vue")['default']>
    'LazyDashboardTopList': LazyComponent<typeof import("../app/components/Dashboard/TopList.vue")['default']>
    'LazyDashboardVolatility': LazyComponent<typeof import("../app/components/Dashboard/Volatility.vue")['default']>
    'LazyDashboardVolumeLeaders': LazyComponent<typeof import("../app/components/Dashboard/VolumeLeaders.vue")['default']>
    'LazyDashboardVolumeSurge': LazyComponent<typeof import("../app/components/Dashboard/VolumeSurge.vue")['default']>
    'LazyDashboardWatchlistMini': LazyComponent<typeof import("../app/components/Dashboard/WatchlistMini.vue")['default']>
    'LazyMarketAssetDetailPanel': LazyComponent<typeof import("../app/components/Market/AssetDetailPanel.vue")['default']>
    'LazyMarketAssetOverview': LazyComponent<typeof import("../app/components/Market/AssetOverview.vue")['default']>
    'LazyMarketLiveToggle': LazyComponent<typeof import("../app/components/Market/LiveToggle.vue")['default']>
    'LazyMarketBidAsk': LazyComponent<typeof import("../app/components/Market/MarketBidAsk.vue")['default']>
    'LazyMarketCategoryBar': LazyComponent<typeof import("../app/components/Market/MarketCategoryBar.vue")['default']>
    'LazyMarketCommunity': LazyComponent<typeof import("../app/components/Market/MarketCommunity.vue")['default']>
    'LazyMarketDepthChart': LazyComponent<typeof import("../app/components/Market/MarketDepthChart.vue")['default']>
    'LazyMarketHighlights': LazyComponent<typeof import("../app/components/Market/MarketHighlights.vue")['default']>
    'LazyMarketHighlightsCard': LazyComponent<typeof import("../app/components/Market/MarketHighlightsCard.vue")['default']>
    'LazyMarketHighlightsRow': LazyComponent<typeof import("../app/components/Market/MarketHighlightsRow.vue")['default']>
    'LazyMarketOrderBook': LazyComponent<typeof import("../app/components/Market/MarketOrderBook.vue")['default']>
    'LazyMarketPairsForBase': LazyComponent<typeof import("../app/components/Market/MarketPairsForBase.vue")['default']>
    'LazyMarketPerformanceChips': LazyComponent<typeof import("../app/components/Market/MarketPerformanceChips.vue")['default']>
    'LazyMarketRecentTrades': LazyComponent<typeof import("../app/components/Market/MarketRecentTrades.vue")['default']>
    'LazyMarketTable': LazyComponent<typeof import("../app/components/Market/MarketTable.vue")['default']>
    'LazyMarketTablePro': LazyComponent<typeof import("../app/components/Market/MarketTablePro.vue")['default']>
    'LazyMarketTickerStats': LazyComponent<typeof import("../app/components/Market/MarketTickerStats.vue")['default']>
    'LazyMarketVolumeSplit': LazyComponent<typeof import("../app/components/Market/MarketVolumeSplit.vue")['default']>
    'LazyMarketWhaleTrades': LazyComponent<typeof import("../app/components/Market/MarketWhaleTrades.vue")['default']>
    'LazyMarketPagination': LazyComponent<typeof import("../app/components/Market/Pagination.vue")['default']>
    'LazyMarketStatCard': LazyComponent<typeof import("../app/components/Market/StatCard.vue")['default']>
    'LazyMarketTickerCard': LazyComponent<typeof import("../app/components/Market/TickerCard.vue")['default']>
    'LazyMarketTopGainers': LazyComponent<typeof import("../app/components/Market/TopGainers.vue")['default']>
    'LazyMarketWatchlistToggle': LazyComponent<typeof import("../app/components/Market/WatchlistToggle.vue")['default']>
    'LazyNewsHighlights': LazyComponent<typeof import("../app/components/news/NewsHighlights.vue")['default']>
    'LazyNewsStats': LazyComponent<typeof import("../app/components/news/NewsStats.vue")['default']>
    'LazyUiCoinLogo': LazyComponent<typeof import("../app/components/ui/CoinLogo.vue")['default']>
    'LazyUiRowSkeleton': LazyComponent<typeof import("../app/components/ui/RowSkeleton.vue")['default']>
    'LazyUiSkeletonBlock': LazyComponent<typeof import("../app/components/ui/SkeletonBlock.vue")['default']>
    'LazyUiSkeletonLine': LazyComponent<typeof import("../app/components/ui/SkeletonLine.vue")['default']>
    'LazyUAccordion': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Accordion.vue")['default']>
    'LazyUAlert': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Alert.vue")['default']>
    'LazyUApp': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/App.vue")['default']>
    'LazyUAvatar': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Avatar.vue")['default']>
    'LazyUAvatarGroup': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/AvatarGroup.vue")['default']>
    'LazyUBadge': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Badge.vue")['default']>
    'LazyUBreadcrumb': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Breadcrumb.vue")['default']>
    'LazyUButton': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Button.vue")['default']>
    'LazyUButtonGroup': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ButtonGroup.vue")['default']>
    'LazyUCalendar': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Calendar.vue")['default']>
    'LazyUCard': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Card.vue")['default']>
    'LazyUCarousel': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Carousel.vue")['default']>
    'LazyUCheckbox': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Checkbox.vue")['default']>
    'LazyUCheckboxGroup': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/CheckboxGroup.vue")['default']>
    'LazyUChip': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Chip.vue")['default']>
    'LazyUCollapsible': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Collapsible.vue")['default']>
    'LazyUColorPicker': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ColorPicker.vue")['default']>
    'LazyUCommandPalette': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/CommandPalette.vue")['default']>
    'LazyUContainer': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Container.vue")['default']>
    'LazyUContextMenu': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ContextMenu.vue")['default']>
    'LazyUContextMenuContent': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ContextMenuContent.vue")['default']>
    'LazyUDrawer': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Drawer.vue")['default']>
    'LazyUDropdownMenu': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/DropdownMenu.vue")['default']>
    'LazyUDropdownMenuContent': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/DropdownMenuContent.vue")['default']>
    'LazyUFileUpload': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/FileUpload.vue")['default']>
    'LazyUForm': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Form.vue")['default']>
    'LazyUFormField': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/FormField.vue")['default']>
    'LazyUIcon': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Icon.vue")['default']>
    'LazyUInput': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Input.vue")['default']>
    'LazyUInputMenu': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/InputMenu.vue")['default']>
    'LazyUInputNumber': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/InputNumber.vue")['default']>
    'LazyUInputTags': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/InputTags.vue")['default']>
    'LazyUKbd': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Kbd.vue")['default']>
    'LazyULink': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Link.vue")['default']>
    'LazyULinkBase': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/LinkBase.vue")['default']>
    'LazyUModal': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Modal.vue")['default']>
    'LazyUNavigationMenu': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/NavigationMenu.vue")['default']>
    'LazyUOverlayProvider': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/OverlayProvider.vue")['default']>
    'LazyUPagination': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Pagination.vue")['default']>
    'LazyUPinInput': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/PinInput.vue")['default']>
    'LazyUPopover': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Popover.vue")['default']>
    'LazyUProgress': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Progress.vue")['default']>
    'LazyURadioGroup': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/RadioGroup.vue")['default']>
    'LazyUSelect': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Select.vue")['default']>
    'LazyUSelectMenu': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/SelectMenu.vue")['default']>
    'LazyUSeparator': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Separator.vue")['default']>
    'LazyUSkeleton': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Skeleton.vue")['default']>
    'LazyUSlideover': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Slideover.vue")['default']>
    'LazyUSlider': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Slider.vue")['default']>
    'LazyUStepper': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Stepper.vue")['default']>
    'LazyUSwitch': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Switch.vue")['default']>
    'LazyUTable': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Table.vue")['default']>
    'LazyUTabs': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Tabs.vue")['default']>
    'LazyUTextarea': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Textarea.vue")['default']>
    'LazyUTimeline': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Timeline.vue")['default']>
    'LazyUToast': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Toast.vue")['default']>
    'LazyUToaster': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Toaster.vue")['default']>
    'LazyUTooltip': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Tooltip.vue")['default']>
    'LazyUTree': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Tree.vue")['default']>
    'LazyNuxtWelcome': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
    'LazyNuxtLayout': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
    'LazyNuxtErrorBoundary': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
    'LazyClientOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
    'LazyDevOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
    'LazyServerPlaceholder': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtLink': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
    'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
    'LazyNuxtTime': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
    'LazyNuxtImg': LazyComponent<typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']>
    'LazyNuxtPicture': LazyComponent<typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']>
    'LazyIcon': LazyComponent<typeof import("../node_modules/@nuxt/icon/dist/runtime/components/index")['default']>
    'LazyColorScheme': LazyComponent<typeof import("../node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']>
    'LazyNuxtPage': LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
    'LazyNoScript': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
    'LazyLink': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
    'LazyBase': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
    'LazyTitle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
    'LazyMeta': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
    'LazyStyle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
    'LazyHead': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
    'LazyHtml': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
    'LazyBody': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
    'LazyNuxtIsland': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
    'LazyChartsTvAdvancedChart': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export const ChartsDonut: typeof import("../app/components/Charts/Donut.vue")['default']
export const ChartsMarketApexKlinesChart: typeof import("../app/components/Charts/MarketApexKlinesChart.vue")['default']
export const ChartsSparkline: typeof import("../app/components/Charts/Sparkline.vue")['default']
export const ChartsTvAdvancedChart: typeof import("../app/components/Charts/TvAdvancedChart.client.vue")['default']
export const DashboardBreadthBar: typeof import("../app/components/Dashboard/BreadthBar.vue")['default']
export const DashboardDonutBreadth: typeof import("../app/components/Dashboard/DonutBreadth.vue")['default']
export const DashboardDonutDominance: typeof import("../app/components/Dashboard/DonutDominance.vue")['default']
export const DashboardDonutQuoteBreakdown: typeof import("../app/components/Dashboard/DonutQuoteBreakdown.vue")['default']
export const DashboardGainers: typeof import("../app/components/Dashboard/Gainers.vue")['default']
export const DashboardHeatmap: typeof import("../app/components/Dashboard/Heatmap.vue")['default']
export const DashboardKpiGrid: typeof import("../app/components/Dashboard/KpiGrid.vue")['default']
export const DashboardLiquidity: typeof import("../app/components/Dashboard/Liquidity.vue")['default']
export const DashboardLosers: typeof import("../app/components/Dashboard/Losers.vue")['default']
export const DashboardQuoteBreakdown: typeof import("../app/components/Dashboard/QuoteBreakdown.vue")['default']
export const DashboardStatCardLink: typeof import("../app/components/Dashboard/StatCardLink.vue")['default']
export const DashboardTopList: typeof import("../app/components/Dashboard/TopList.vue")['default']
export const DashboardVolatility: typeof import("../app/components/Dashboard/Volatility.vue")['default']
export const DashboardVolumeLeaders: typeof import("../app/components/Dashboard/VolumeLeaders.vue")['default']
export const DashboardVolumeSurge: typeof import("../app/components/Dashboard/VolumeSurge.vue")['default']
export const DashboardWatchlistMini: typeof import("../app/components/Dashboard/WatchlistMini.vue")['default']
export const MarketAssetDetailPanel: typeof import("../app/components/Market/AssetDetailPanel.vue")['default']
export const MarketAssetOverview: typeof import("../app/components/Market/AssetOverview.vue")['default']
export const MarketLiveToggle: typeof import("../app/components/Market/LiveToggle.vue")['default']
export const MarketBidAsk: typeof import("../app/components/Market/MarketBidAsk.vue")['default']
export const MarketCategoryBar: typeof import("../app/components/Market/MarketCategoryBar.vue")['default']
export const MarketCommunity: typeof import("../app/components/Market/MarketCommunity.vue")['default']
export const MarketDepthChart: typeof import("../app/components/Market/MarketDepthChart.vue")['default']
export const MarketHighlights: typeof import("../app/components/Market/MarketHighlights.vue")['default']
export const MarketHighlightsCard: typeof import("../app/components/Market/MarketHighlightsCard.vue")['default']
export const MarketHighlightsRow: typeof import("../app/components/Market/MarketHighlightsRow.vue")['default']
export const MarketOrderBook: typeof import("../app/components/Market/MarketOrderBook.vue")['default']
export const MarketPairsForBase: typeof import("../app/components/Market/MarketPairsForBase.vue")['default']
export const MarketPerformanceChips: typeof import("../app/components/Market/MarketPerformanceChips.vue")['default']
export const MarketRecentTrades: typeof import("../app/components/Market/MarketRecentTrades.vue")['default']
export const MarketTable: typeof import("../app/components/Market/MarketTable.vue")['default']
export const MarketTablePro: typeof import("../app/components/Market/MarketTablePro.vue")['default']
export const MarketTickerStats: typeof import("../app/components/Market/MarketTickerStats.vue")['default']
export const MarketVolumeSplit: typeof import("../app/components/Market/MarketVolumeSplit.vue")['default']
export const MarketWhaleTrades: typeof import("../app/components/Market/MarketWhaleTrades.vue")['default']
export const MarketPagination: typeof import("../app/components/Market/Pagination.vue")['default']
export const MarketStatCard: typeof import("../app/components/Market/StatCard.vue")['default']
export const MarketTickerCard: typeof import("../app/components/Market/TickerCard.vue")['default']
export const MarketTopGainers: typeof import("../app/components/Market/TopGainers.vue")['default']
export const MarketWatchlistToggle: typeof import("../app/components/Market/WatchlistToggle.vue")['default']
export const NewsHighlights: typeof import("../app/components/news/NewsHighlights.vue")['default']
export const NewsStats: typeof import("../app/components/news/NewsStats.vue")['default']
export const UiCoinLogo: typeof import("../app/components/ui/CoinLogo.vue")['default']
export const UiRowSkeleton: typeof import("../app/components/ui/RowSkeleton.vue")['default']
export const UiSkeletonBlock: typeof import("../app/components/ui/SkeletonBlock.vue")['default']
export const UiSkeletonLine: typeof import("../app/components/ui/SkeletonLine.vue")['default']
export const UAccordion: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Accordion.vue")['default']
export const UAlert: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Alert.vue")['default']
export const UApp: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/App.vue")['default']
export const UAvatar: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Avatar.vue")['default']
export const UAvatarGroup: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/AvatarGroup.vue")['default']
export const UBadge: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Badge.vue")['default']
export const UBreadcrumb: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Breadcrumb.vue")['default']
export const UButton: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Button.vue")['default']
export const UButtonGroup: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ButtonGroup.vue")['default']
export const UCalendar: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Calendar.vue")['default']
export const UCard: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Card.vue")['default']
export const UCarousel: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Carousel.vue")['default']
export const UCheckbox: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Checkbox.vue")['default']
export const UCheckboxGroup: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/CheckboxGroup.vue")['default']
export const UChip: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Chip.vue")['default']
export const UCollapsible: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Collapsible.vue")['default']
export const UColorPicker: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ColorPicker.vue")['default']
export const UCommandPalette: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/CommandPalette.vue")['default']
export const UContainer: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Container.vue")['default']
export const UContextMenu: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ContextMenu.vue")['default']
export const UContextMenuContent: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ContextMenuContent.vue")['default']
export const UDrawer: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Drawer.vue")['default']
export const UDropdownMenu: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/DropdownMenu.vue")['default']
export const UDropdownMenuContent: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/DropdownMenuContent.vue")['default']
export const UFileUpload: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/FileUpload.vue")['default']
export const UForm: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Form.vue")['default']
export const UFormField: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/FormField.vue")['default']
export const UIcon: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Icon.vue")['default']
export const UInput: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Input.vue")['default']
export const UInputMenu: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/InputMenu.vue")['default']
export const UInputNumber: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/InputNumber.vue")['default']
export const UInputTags: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/InputTags.vue")['default']
export const UKbd: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Kbd.vue")['default']
export const ULink: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Link.vue")['default']
export const ULinkBase: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/LinkBase.vue")['default']
export const UModal: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Modal.vue")['default']
export const UNavigationMenu: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/NavigationMenu.vue")['default']
export const UOverlayProvider: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/OverlayProvider.vue")['default']
export const UPagination: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Pagination.vue")['default']
export const UPinInput: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/PinInput.vue")['default']
export const UPopover: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Popover.vue")['default']
export const UProgress: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Progress.vue")['default']
export const URadioGroup: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/RadioGroup.vue")['default']
export const USelect: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Select.vue")['default']
export const USelectMenu: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/SelectMenu.vue")['default']
export const USeparator: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Separator.vue")['default']
export const USkeleton: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Skeleton.vue")['default']
export const USlideover: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Slideover.vue")['default']
export const USlider: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Slider.vue")['default']
export const UStepper: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Stepper.vue")['default']
export const USwitch: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Switch.vue")['default']
export const UTable: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Table.vue")['default']
export const UTabs: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Tabs.vue")['default']
export const UTextarea: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Textarea.vue")['default']
export const UTimeline: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Timeline.vue")['default']
export const UToast: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Toast.vue")['default']
export const UToaster: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Toaster.vue")['default']
export const UTooltip: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Tooltip.vue")['default']
export const UTree: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Tree.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']
export const NuxtPicture: typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']
export const Icon: typeof import("../node_modules/@nuxt/icon/dist/runtime/components/index")['default']
export const ColorScheme: typeof import("../node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const ChartsTvAdvancedChart: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const LazyChartsDonut: LazyComponent<typeof import("../app/components/Charts/Donut.vue")['default']>
export const LazyChartsMarketApexKlinesChart: LazyComponent<typeof import("../app/components/Charts/MarketApexKlinesChart.vue")['default']>
export const LazyChartsSparkline: LazyComponent<typeof import("../app/components/Charts/Sparkline.vue")['default']>
export const LazyChartsTvAdvancedChart: LazyComponent<typeof import("../app/components/Charts/TvAdvancedChart.client.vue")['default']>
export const LazyDashboardBreadthBar: LazyComponent<typeof import("../app/components/Dashboard/BreadthBar.vue")['default']>
export const LazyDashboardDonutBreadth: LazyComponent<typeof import("../app/components/Dashboard/DonutBreadth.vue")['default']>
export const LazyDashboardDonutDominance: LazyComponent<typeof import("../app/components/Dashboard/DonutDominance.vue")['default']>
export const LazyDashboardDonutQuoteBreakdown: LazyComponent<typeof import("../app/components/Dashboard/DonutQuoteBreakdown.vue")['default']>
export const LazyDashboardGainers: LazyComponent<typeof import("../app/components/Dashboard/Gainers.vue")['default']>
export const LazyDashboardHeatmap: LazyComponent<typeof import("../app/components/Dashboard/Heatmap.vue")['default']>
export const LazyDashboardKpiGrid: LazyComponent<typeof import("../app/components/Dashboard/KpiGrid.vue")['default']>
export const LazyDashboardLiquidity: LazyComponent<typeof import("../app/components/Dashboard/Liquidity.vue")['default']>
export const LazyDashboardLosers: LazyComponent<typeof import("../app/components/Dashboard/Losers.vue")['default']>
export const LazyDashboardQuoteBreakdown: LazyComponent<typeof import("../app/components/Dashboard/QuoteBreakdown.vue")['default']>
export const LazyDashboardStatCardLink: LazyComponent<typeof import("../app/components/Dashboard/StatCardLink.vue")['default']>
export const LazyDashboardTopList: LazyComponent<typeof import("../app/components/Dashboard/TopList.vue")['default']>
export const LazyDashboardVolatility: LazyComponent<typeof import("../app/components/Dashboard/Volatility.vue")['default']>
export const LazyDashboardVolumeLeaders: LazyComponent<typeof import("../app/components/Dashboard/VolumeLeaders.vue")['default']>
export const LazyDashboardVolumeSurge: LazyComponent<typeof import("../app/components/Dashboard/VolumeSurge.vue")['default']>
export const LazyDashboardWatchlistMini: LazyComponent<typeof import("../app/components/Dashboard/WatchlistMini.vue")['default']>
export const LazyMarketAssetDetailPanel: LazyComponent<typeof import("../app/components/Market/AssetDetailPanel.vue")['default']>
export const LazyMarketAssetOverview: LazyComponent<typeof import("../app/components/Market/AssetOverview.vue")['default']>
export const LazyMarketLiveToggle: LazyComponent<typeof import("../app/components/Market/LiveToggle.vue")['default']>
export const LazyMarketBidAsk: LazyComponent<typeof import("../app/components/Market/MarketBidAsk.vue")['default']>
export const LazyMarketCategoryBar: LazyComponent<typeof import("../app/components/Market/MarketCategoryBar.vue")['default']>
export const LazyMarketCommunity: LazyComponent<typeof import("../app/components/Market/MarketCommunity.vue")['default']>
export const LazyMarketDepthChart: LazyComponent<typeof import("../app/components/Market/MarketDepthChart.vue")['default']>
export const LazyMarketHighlights: LazyComponent<typeof import("../app/components/Market/MarketHighlights.vue")['default']>
export const LazyMarketHighlightsCard: LazyComponent<typeof import("../app/components/Market/MarketHighlightsCard.vue")['default']>
export const LazyMarketHighlightsRow: LazyComponent<typeof import("../app/components/Market/MarketHighlightsRow.vue")['default']>
export const LazyMarketOrderBook: LazyComponent<typeof import("../app/components/Market/MarketOrderBook.vue")['default']>
export const LazyMarketPairsForBase: LazyComponent<typeof import("../app/components/Market/MarketPairsForBase.vue")['default']>
export const LazyMarketPerformanceChips: LazyComponent<typeof import("../app/components/Market/MarketPerformanceChips.vue")['default']>
export const LazyMarketRecentTrades: LazyComponent<typeof import("../app/components/Market/MarketRecentTrades.vue")['default']>
export const LazyMarketTable: LazyComponent<typeof import("../app/components/Market/MarketTable.vue")['default']>
export const LazyMarketTablePro: LazyComponent<typeof import("../app/components/Market/MarketTablePro.vue")['default']>
export const LazyMarketTickerStats: LazyComponent<typeof import("../app/components/Market/MarketTickerStats.vue")['default']>
export const LazyMarketVolumeSplit: LazyComponent<typeof import("../app/components/Market/MarketVolumeSplit.vue")['default']>
export const LazyMarketWhaleTrades: LazyComponent<typeof import("../app/components/Market/MarketWhaleTrades.vue")['default']>
export const LazyMarketPagination: LazyComponent<typeof import("../app/components/Market/Pagination.vue")['default']>
export const LazyMarketStatCard: LazyComponent<typeof import("../app/components/Market/StatCard.vue")['default']>
export const LazyMarketTickerCard: LazyComponent<typeof import("../app/components/Market/TickerCard.vue")['default']>
export const LazyMarketTopGainers: LazyComponent<typeof import("../app/components/Market/TopGainers.vue")['default']>
export const LazyMarketWatchlistToggle: LazyComponent<typeof import("../app/components/Market/WatchlistToggle.vue")['default']>
export const LazyNewsHighlights: LazyComponent<typeof import("../app/components/news/NewsHighlights.vue")['default']>
export const LazyNewsStats: LazyComponent<typeof import("../app/components/news/NewsStats.vue")['default']>
export const LazyUiCoinLogo: LazyComponent<typeof import("../app/components/ui/CoinLogo.vue")['default']>
export const LazyUiRowSkeleton: LazyComponent<typeof import("../app/components/ui/RowSkeleton.vue")['default']>
export const LazyUiSkeletonBlock: LazyComponent<typeof import("../app/components/ui/SkeletonBlock.vue")['default']>
export const LazyUiSkeletonLine: LazyComponent<typeof import("../app/components/ui/SkeletonLine.vue")['default']>
export const LazyUAccordion: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Accordion.vue")['default']>
export const LazyUAlert: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Alert.vue")['default']>
export const LazyUApp: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/App.vue")['default']>
export const LazyUAvatar: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Avatar.vue")['default']>
export const LazyUAvatarGroup: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/AvatarGroup.vue")['default']>
export const LazyUBadge: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Badge.vue")['default']>
export const LazyUBreadcrumb: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Breadcrumb.vue")['default']>
export const LazyUButton: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Button.vue")['default']>
export const LazyUButtonGroup: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ButtonGroup.vue")['default']>
export const LazyUCalendar: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Calendar.vue")['default']>
export const LazyUCard: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Card.vue")['default']>
export const LazyUCarousel: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Carousel.vue")['default']>
export const LazyUCheckbox: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Checkbox.vue")['default']>
export const LazyUCheckboxGroup: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/CheckboxGroup.vue")['default']>
export const LazyUChip: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Chip.vue")['default']>
export const LazyUCollapsible: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Collapsible.vue")['default']>
export const LazyUColorPicker: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ColorPicker.vue")['default']>
export const LazyUCommandPalette: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/CommandPalette.vue")['default']>
export const LazyUContainer: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Container.vue")['default']>
export const LazyUContextMenu: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ContextMenu.vue")['default']>
export const LazyUContextMenuContent: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/ContextMenuContent.vue")['default']>
export const LazyUDrawer: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Drawer.vue")['default']>
export const LazyUDropdownMenu: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/DropdownMenu.vue")['default']>
export const LazyUDropdownMenuContent: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/DropdownMenuContent.vue")['default']>
export const LazyUFileUpload: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/FileUpload.vue")['default']>
export const LazyUForm: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Form.vue")['default']>
export const LazyUFormField: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/FormField.vue")['default']>
export const LazyUIcon: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Icon.vue")['default']>
export const LazyUInput: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Input.vue")['default']>
export const LazyUInputMenu: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/InputMenu.vue")['default']>
export const LazyUInputNumber: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/InputNumber.vue")['default']>
export const LazyUInputTags: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/InputTags.vue")['default']>
export const LazyUKbd: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Kbd.vue")['default']>
export const LazyULink: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Link.vue")['default']>
export const LazyULinkBase: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/LinkBase.vue")['default']>
export const LazyUModal: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Modal.vue")['default']>
export const LazyUNavigationMenu: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/NavigationMenu.vue")['default']>
export const LazyUOverlayProvider: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/OverlayProvider.vue")['default']>
export const LazyUPagination: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Pagination.vue")['default']>
export const LazyUPinInput: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/PinInput.vue")['default']>
export const LazyUPopover: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Popover.vue")['default']>
export const LazyUProgress: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Progress.vue")['default']>
export const LazyURadioGroup: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/RadioGroup.vue")['default']>
export const LazyUSelect: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Select.vue")['default']>
export const LazyUSelectMenu: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/SelectMenu.vue")['default']>
export const LazyUSeparator: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Separator.vue")['default']>
export const LazyUSkeleton: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Skeleton.vue")['default']>
export const LazyUSlideover: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Slideover.vue")['default']>
export const LazyUSlider: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Slider.vue")['default']>
export const LazyUStepper: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Stepper.vue")['default']>
export const LazyUSwitch: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Switch.vue")['default']>
export const LazyUTable: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Table.vue")['default']>
export const LazyUTabs: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Tabs.vue")['default']>
export const LazyUTextarea: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Textarea.vue")['default']>
export const LazyUTimeline: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Timeline.vue")['default']>
export const LazyUToast: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Toast.vue")['default']>
export const LazyUToaster: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Toaster.vue")['default']>
export const LazyUTooltip: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Tooltip.vue")['default']>
export const LazyUTree: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/Tree.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']>
export const LazyIcon: LazyComponent<typeof import("../node_modules/@nuxt/icon/dist/runtime/components/index")['default']>
export const LazyColorScheme: LazyComponent<typeof import("../node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
export const LazyChartsTvAdvancedChart: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>

export const componentNames: string[]
