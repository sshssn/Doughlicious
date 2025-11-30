import Link from "next/link"
import Image from "next/image"
import { serverComms } from "../lib/servercomms"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { ProductCard } from "../components/shared/ProductCard"
import { HeroVideo } from "../components/shared/HeroVideo"
import { Product } from "../types"
import { Star, Clock, Award, Truck, Shield, Heart } from "lucide-react"

export default async function Page() {
  const res = await serverComms("products")
  const products: Product[] = res.data ?? []
  const featured = products.slice(0, 6)
  
  // If API error, still show page but with empty products
  if (res.error) {
    console.error('Failed to load products:', res.error)
  }

  return (
    <main className="flex flex-col" style={{ margin: 0, padding: 0, marginTop: 0, paddingTop: 0 }}>
      {/* Hero Section with Animated Gradient */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden" style={{ margin: 0, padding: 0, marginTop: 0, paddingTop: 0 }}>
        {/* Video Background */}
        <HeroVideo />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 w-full h-full bg-black/20 z-[1]" style={{ top: 0, left: 0, right: 0, bottom: 0 }}></div>
        
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 via-accent/15 to-secondary/10 animate-gradient z-[2]" style={{ top: 0, left: 0, right: 0, bottom: 0 }}></div>
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_50%)] z-[2]" style={{ top: 0, left: 0, right: 0, bottom: 0 }}></div>

        {/* Floating Donuts Decoration */}
        <div className="absolute top-20 left-10 w-32 h-32 opacity-20 animate-float">
          <div className="w-full h-full rounded-full bg-primary/30 blur-xl"></div>
        </div>
        <div className="absolute bottom-20 right-10 w-40 h-40 opacity-20 animate-float-delayed">
          <div className="w-full h-full rounded-full bg-accent/30 blur-xl"></div>
        </div>

        <div className="relative z-[3] max-w-6xl mx-auto px-4 text-center space-y-8 pt-20">
          {/* Logo in Hero */}
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.svg" 
              alt="Doughlicious" 
              className="h-24 w-24 sm:h-32 sm:w-32 md:h-36 md:w-36 object-contain max-w-[90vw] max-h-[30vh]" 
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
            <Star className="h-4 w-4 text-white fill-white" />
            <span className="text-sm font-medium text-white">Rated 4.9/5 by 1000+ Happy Customers</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-heading font-bold tracking-tight">
            <span className="text-white">
              Happiness
            </span>
            <br />
            <span className="text-white">Delivered Fresh</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed">
            Artisan donuts crafted with premium ingredients, baked fresh every morning.
            Experience the perfect blend of tradition and innovation in every bite.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/menu">
              <Button size="lg" className="text-lg px-10 py-7 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 text-white border-0">
                Order Now
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant="outline" size="lg" className="text-lg px-10 py-7 rounded-full hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20">
                View Menu
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 pt-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Clock className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white">Fresh Daily</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Truck className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white">Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Shield className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white">Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-sm font-medium text-white">Online Payment</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-white">Collection from Branch</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-bold">Premium Quality</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Only the finest ingredients make it into our donuts. We source locally and prioritize quality above all.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-bold">Baked Fresh Daily</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every morning, our bakers start before dawn to ensure you get the freshest donuts possible.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-bold">Made with Love</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Each donut is handcrafted by our passionate team who pour their heart into every creation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-sm font-semibold text-primary">OUR BESTSELLERS</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-heading font-bold">
              Customer Favorites
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover why these treats have won the hearts of thousands
            </p>
          </div>

          {featured.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {featured.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              <div className="text-center mt-16">
                <Link href="/menu">
                  <Button size="lg" variant="outline" className="rounded-full px-12 py-6 text-lg hover:scale-105 transition-all">
                    Explore Full Menu
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">Loading our delicious selection...</p>
              <Link href="/menu">
                <Button size="lg" className="rounded-full px-12 py-6 text-lg hover:scale-105 transition-all">
                  View Full Menu
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Loved by Thousands
            </h2>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="h-6 w-6 text-primary fill-primary" />
              ))}
              <span className="ml-2 text-lg font-semibold">4.9/5 from 1,200+ reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8 space-y-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "Absolutely the best donuts I've ever had! The glazed donut is perfection. Fresh, fluffy, and not too sweet."
                </p>
                <div className="font-semibold">Sarah M.</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8 space-y-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "The online ordering is so easy and the donuts are always ready when I arrive. Perfect for office meetings!"
                </p>
                <div className="font-semibold">James T.</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8 space-y-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "My kids' favorite weekend treat! The variety is amazing and everything tastes homemade. Highly recommend!"
                </p>
                <div className="font-semibold">Emily R.</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-background via-primary/5 to-primary/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-10">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight">
                Ready to Taste Happiness?
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Order now and get your fresh donuts delivered or ready for pickup in minutes
              </p>
            </div>
            <div className="pt-4">
              <Link href="/menu">
                <Button 
                  size="lg" 
                  className="text-base md:text-lg px-8 md:px-12 py-6 md:py-7 rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Start Your Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}