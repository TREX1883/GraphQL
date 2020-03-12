import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const PrismaClient = new PrismaClient()

const uvu_courses = fs.readFileSync('prisma/example_files/uvu_courses.json')
//insert new MTG API there
function loadUVUCourses() {
    const catalog = JSON.parse(uvu_courses)
    const allCourses = catalog.comet.allCourses
    const dgmCourses = allCourses.filter(
        course =>
        course.prefix._text === 'DGM' ||
        course.prefix._text === 'CS' ||
        course.prefix._text === 'IT' ||
        course.prefix._text === 'INFO',
    )
    return dgmCourses.map( crs => {
        return {
            data: {
                name: crs.title._text,
                description: crs.description._text,
                defaultCredits: crs.totalCredit._text,
                courseCode: `${crs.prefix._text} ${crs.number._text}`,
                termsOffered: crs.termsoffered._text || "Fall",
            }
        }
    })
}

async function main() {
    try {
        const allCourses = loadUVUCourses()
        for (let crs of allCourses) {
            await PrismaClient.course.create(crs)
            .catch(err => console.log('Error trying to create UVU courses: ${err} course ${crs}'))
        }
    } catch (err) {
        console.log(err)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await PrismaClient.disconnect()
    })
