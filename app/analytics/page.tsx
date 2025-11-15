"use client"

import { useState } from "react"
import { TrendingUp, Users, DollarSign, Calendar, ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"

const analyticsData = {
  overview: {
    totalRevenue: "2,847 SOL",
    totalTicketsSold: 12450,
    totalEvents: 28,
    avgRating: 4.7,
    revenueChange: "+23%",
    ticketsChange: "+15%",
    eventsChange: "+4",
    ratingChange: "+0.3",
  },
  topEvents: [
    {
      id: 1,
      title: "Solana Developer Conference 2025",
      revenue: "625 SOL",
      tickets: 2500,
      rating: 4.9,
      image: "/placeholder.svg?height=100&width=150&text=Solana+Conf",
    },
    {
      id: 2,
      title: "Crypto Music Festival",
      revenue: "480 SOL",
      tickets: 1800,
      rating: 4.8,
      image: "/placeholder.svg?height=100&width=150&text=Music+Festival",
    },
    {
      id: 3,
      title: "NFT Art Exhibition",
      revenue: "320 SOL",
      tickets: 1200,
      rating: 4.7,
      image: "/placeholder.svg?height=100&width=150&text=Art+Exhibition",
    },
  ],
  demographics: {
    ageGroups: [
      { range: "18-25", percentage: 35 },
      { range: "26-35", percentage: 40 },
      { range: "36-45", percentage: 20 },
      { range: "46+", percentage: 5 },
    ],
    locations: [
      { city: "San Francisco", percentage: 25 },
      { city: "New York", percentage: 20 },
      { city: "Los Angeles", percentage: 15 },
      { city: "Austin", percentage: 12 },
      { city: "Miami", percentage: 10 },
      { city: "Others", percentage: 18 },
    ],
  },
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-white/80 hover:text-cyan-400 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <div className="flex items-center space-x-3">
                <Image src="/parchi-logo.png" alt="Parchi" width={32} height={32} className="rounded-lg" />
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Analytics Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="7d" className="text-white hover:bg-slate-700">
                    Last 7 days
                  </SelectItem>
                  <SelectItem value="30d" className="text-white hover:bg-slate-700">
                    Last 30 days
                  </SelectItem>
                  <SelectItem value="90d" className="text-white hover:bg-slate-700">
                    Last 90 days
                  </SelectItem>
                  <SelectItem value="1y" className="text-white hover:bg-slate-700">
                    Last year
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-white/70 text-lg">Track your event performance and audience insights</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Event Performance
            </TabsTrigger>
            <TabsTrigger value="audience" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Audience Insights
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Revenue Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">{analyticsData.overview.totalRevenue}</p>
                      <p className="text-green-400 text-xs">{analyticsData.overview.revenueChange} from last period</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-cyan-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Tickets Sold</p>
                      <p className="text-2xl font-bold text-white">
                        {analyticsData.overview.totalTicketsSold.toLocaleString()}
                      </p>
                      <p className="text-green-400 text-xs">{analyticsData.overview.ticketsChange} from last period</p>
                    </div>
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Events</p>
                      <p className="text-2xl font-bold text-white">{analyticsData.overview.totalEvents}</p>
                      <p className="text-green-400 text-xs">{analyticsData.overview.eventsChange} from last period</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Avg. Rating</p>
                      <p className="text-2xl font-bold text-white">{analyticsData.overview.avgRating}</p>
                      <p className="text-green-400 text-xs">{analyticsData.overview.ratingChange} from last period</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                    <p className="text-white/40">Revenue trend chart will be displayed here</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Ticket Sales Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                    <p className="text-white/40">Ticket sales chart will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Top Performing Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topEvents.map((event, index) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-cyan-400">#{index + 1}</div>
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          width={80}
                          height={60}
                          className="rounded-lg"
                        />
                        <div>
                          <h4 className="text-white font-medium">{event.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-white/60">
                            <span>{event.tickets} tickets sold</span>
                            <span>Rating: {event.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-cyan-400 font-bold text-lg">{event.revenue}</div>
                        <Link href={`/events/${event.id}/analytics`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 mt-2 bg-transparent"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Age Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.demographics.ageGroups.map((group) => (
                      <div key={group.range} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{group.range}</span>
                          <span className="text-cyan-400">{group.percentage}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                            style={{ width: `${group.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.demographics.locations.map((location) => (
                      <div key={location.city} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{location.city}</span>
                          <span className="text-cyan-400">{location.percentage}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                            style={{ width: `${location.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-white/5 rounded-lg flex items-center justify-center">
                    <p className="text-white/40">Revenue breakdown chart</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-white/5 rounded-lg flex items-center justify-center">
                    <p className="text-white/40">Monthly revenue chart</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-white/5 rounded-lg flex items-center justify-center">
                    <p className="text-white/40">Revenue forecast chart</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
