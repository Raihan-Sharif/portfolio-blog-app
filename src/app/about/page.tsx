import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ArrowRight, Download, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl">
              <Image
                src="/images/profile-placeholder.jpg"
                alt="Raihan Sharif"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-7">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">About Me</h1>

            <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
              Hi there! I'm Raihan Sharif, a full-stack developer with over 6
              years of experience building modern web applications. I specialize
              in technologies like .NET, React, Next.js, and various database
              systems.
            </p>

            <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
              My journey in software development began after completing my
              degree in Computer Science. I'm passionate about creating clean,
              efficient, and user-friendly applications that solve real-world
              problems.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button className="gap-2">
                <Download size={16} />
                Download CV
              </Button>

              <Link href="/contact">
                <Button variant="outline" className="gap-2">
                  <Mail size={16} />
                  Contact Me
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-8">My Experience</h2>

          <div className="space-y-8">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">
                    Senior Full Stack Developer
                  </h3>
                  <p className="text-primary">XYZ Company</p>
                </div>
                <div className="mt-2 md:mt-0 text-muted-foreground">
                  {formatDate("2022-01-01")} - Present
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Leading development of modern web applications using .NET Core,
                React, and Azure. Implemented CI/CD pipelines, automated
                testing, and improved system performance.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-accent rounded-full text-xs">
                  React
                </span>
                <span className="px-3 py-1 bg-accent rounded-full text-xs">
                  .NET Core
                </span>
                <span className="px-3 py-1 bg-accent rounded-full text-xs">
                  Azure
                </span>
                <span className="px-3 py-1 bg-accent rounded-full text-xs">
                  SQL Server
                </span>
              </div>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">Full Stack Developer</h3>
                  <p className="text-primary">ABC Tech</p>
                </div>
                <div className="mt-2 md:mt-0 text-muted-foreground">
                  {formatDate("2019-05-01")} - {formatDate("2021-12-31")}
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Developed and maintained web applications for clients in various
                industries. Collaborated with design and product teams to
                deliver high-quality software.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-accent rounded-full text-xs">
                  JavaScript
                </span>
                <span className="px-3 py-1 bg-accent rounded-full text-xs">
                  Node.js
                </span>
                <span className="px-3 py-1 bg-accent rounded-full text-xs">
                  React
                </span>
                <span className="px-3 py-1 bg-accent rounded-full text-xs">
                  MongoDB
                </span>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Education</h2>

            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">
                    Bachelor of Science in Computer Science
                  </h3>
                  <p className="text-primary">University of Technology</p>
                </div>
                <div className="mt-2 md:mt-0 text-muted-foreground">
                  {formatDate("2015-09-01")} - {formatDate("2019-04-30")}
                </div>
              </div>
              <p className="text-muted-foreground">
                Graduated with honors. Focused on software engineering,
                databases, and web development.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/projects">
              <Button className="gap-2">
                See My Projects
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
