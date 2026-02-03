import '../../css/HOME/aboutus.css'

function AboutUs() {
    return (
        <>
            <section className="about-hero">
                <div className="container">
                    <h1>About Zastra</h1>
                    <p>Empowering communities to improve public infrastructure — one report at a time.</p>
                </div>
            </section>

            <section className="section-light">
                <div className="container">
                    <h2>Our Story</h2>
                    <p>
                        Zastra was born out of a simple but powerful idea: that every citizen should have an easy and
                        direct way to report problems in their community’s infrastructure. Seeing how many roads,
                        sidewalks, and public facilities in the city of Bekasi suffer from neglect, we wanted to
                        create a platform that empowers people to be heard and to drive real improvements.
                        What started as a small initiative quickly grew into a community-focused app that bridges
                        the gap between everyday users and local authorities — making it easier than ever to take
                        action.
                    </p>
                </div>
            </section>

            <section className="section-dark">
                <div className="container">
                    <h2>Our Mission</h2>
                    <p>
                        Our mission is to make reporting infrastructure problems in Bekasi simple, accessible,
                        and impactful. We strive to empower communities by providing a user-friendly platform
                        that transforms observations into action.
                        By facilitating communication between citizens and officials, Zastra aims to accelerate
                        repairs, enhance safety, and contribute to stronger, better-maintained neighborhoods.
                    </p>
                </div>
            </section>

            <section className="section-light">
                <div className="container">
                    <h2>The Four Freedoms</h2>
                    <ul className="freedoms-list">
                        <li><strong>Freedom to Report</strong> — Everyone should be able to raise awareness about issues
                            without barriers.
                        </li>
                        <li><strong>Freedom to Be Heard</strong> — Reports matter. We ensure your concerns reach the
                            right people.
                        </li>
                        <li><strong>Freedom to Improve</strong> — Collective action can create safer and more reliable
                            infrastructure.
                        </li>
                        <li><strong>Freedom to Connect</strong> — We bridge the gap between citizens and local
                            authorities to build trust.
                        </li>
                    </ul>
                    <p>Together, these freedoms guide us in creating a platform that empowers you to help build a better
                        Bekasi, one report at a time.</p>
                </div>
            </section>
        </>
    );
}

export default AboutUs;