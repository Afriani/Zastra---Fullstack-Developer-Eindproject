--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-11-30 19:10:35

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5072 (class 2613 OID 42553)
-- Name: 42553..51046; Type: BLOB METADATA; Schema: -; Owner: zastra_user
--

SELECT pg_catalog.lo_create('42553');
SELECT pg_catalog.lo_create('42554');
SELECT pg_catalog.lo_create('42764');
SELECT pg_catalog.lo_create('42765');
SELECT pg_catalog.lo_create('42766');
SELECT pg_catalog.lo_create('42767');
SELECT pg_catalog.lo_create('42768');
SELECT pg_catalog.lo_create('42769');
SELECT pg_catalog.lo_create('42770');
SELECT pg_catalog.lo_create('42771');
SELECT pg_catalog.lo_create('50968');
SELECT pg_catalog.lo_create('50969');
SELECT pg_catalog.lo_create('50970');
SELECT pg_catalog.lo_create('51002');
SELECT pg_catalog.lo_create('51003');
SELECT pg_catalog.lo_create('51004');
SELECT pg_catalog.lo_create('51005');
SELECT pg_catalog.lo_create('51006');
SELECT pg_catalog.lo_create('51007');
SELECT pg_catalog.lo_create('51008');
SELECT pg_catalog.lo_create('51009');
SELECT pg_catalog.lo_create('51010');
SELECT pg_catalog.lo_create('51011');
SELECT pg_catalog.lo_create('51012');
SELECT pg_catalog.lo_create('51013');
SELECT pg_catalog.lo_create('51014');
SELECT pg_catalog.lo_create('51015');
SELECT pg_catalog.lo_create('51016');
SELECT pg_catalog.lo_create('51017');
SELECT pg_catalog.lo_create('51018');
SELECT pg_catalog.lo_create('51019');
SELECT pg_catalog.lo_create('51020');
SELECT pg_catalog.lo_create('51021');
SELECT pg_catalog.lo_create('51022');
SELECT pg_catalog.lo_create('51023');
SELECT pg_catalog.lo_create('51024');
SELECT pg_catalog.lo_create('51025');
SELECT pg_catalog.lo_create('51030');
SELECT pg_catalog.lo_create('51031');
SELECT pg_catalog.lo_create('51032');
SELECT pg_catalog.lo_create('51033');
SELECT pg_catalog.lo_create('51034');
SELECT pg_catalog.lo_create('51035');
SELECT pg_catalog.lo_create('51036');
SELECT pg_catalog.lo_create('51037');
SELECT pg_catalog.lo_create('51038');
SELECT pg_catalog.lo_create('51039');
SELECT pg_catalog.lo_create('51040');
SELECT pg_catalog.lo_create('51041');
SELECT pg_catalog.lo_create('51042');
SELECT pg_catalog.lo_create('51043');
SELECT pg_catalog.lo_create('51044');
SELECT pg_catalog.lo_create('51045');
SELECT pg_catalog.lo_create('51046');

ALTER LARGE OBJECT 42553 OWNER TO zastra_user;
ALTER LARGE OBJECT 42554 OWNER TO zastra_user;
ALTER LARGE OBJECT 42764 OWNER TO zastra_user;
ALTER LARGE OBJECT 42765 OWNER TO zastra_user;
ALTER LARGE OBJECT 42766 OWNER TO zastra_user;
ALTER LARGE OBJECT 42767 OWNER TO zastra_user;
ALTER LARGE OBJECT 42768 OWNER TO zastra_user;
ALTER LARGE OBJECT 42769 OWNER TO zastra_user;
ALTER LARGE OBJECT 42770 OWNER TO zastra_user;
ALTER LARGE OBJECT 42771 OWNER TO zastra_user;
ALTER LARGE OBJECT 50968 OWNER TO zastra_user;
ALTER LARGE OBJECT 50969 OWNER TO zastra_user;
ALTER LARGE OBJECT 50970 OWNER TO zastra_user;
ALTER LARGE OBJECT 51002 OWNER TO zastra_user;
ALTER LARGE OBJECT 51003 OWNER TO zastra_user;
ALTER LARGE OBJECT 51004 OWNER TO zastra_user;
ALTER LARGE OBJECT 51005 OWNER TO zastra_user;
ALTER LARGE OBJECT 51006 OWNER TO zastra_user;
ALTER LARGE OBJECT 51007 OWNER TO zastra_user;
ALTER LARGE OBJECT 51008 OWNER TO zastra_user;
ALTER LARGE OBJECT 51009 OWNER TO zastra_user;
ALTER LARGE OBJECT 51010 OWNER TO zastra_user;
ALTER LARGE OBJECT 51011 OWNER TO zastra_user;
ALTER LARGE OBJECT 51012 OWNER TO zastra_user;
ALTER LARGE OBJECT 51013 OWNER TO zastra_user;
ALTER LARGE OBJECT 51014 OWNER TO zastra_user;
ALTER LARGE OBJECT 51015 OWNER TO zastra_user;
ALTER LARGE OBJECT 51016 OWNER TO zastra_user;
ALTER LARGE OBJECT 51017 OWNER TO zastra_user;
ALTER LARGE OBJECT 51018 OWNER TO zastra_user;
ALTER LARGE OBJECT 51019 OWNER TO zastra_user;
ALTER LARGE OBJECT 51020 OWNER TO zastra_user;
ALTER LARGE OBJECT 51021 OWNER TO zastra_user;
ALTER LARGE OBJECT 51022 OWNER TO zastra_user;
ALTER LARGE OBJECT 51023 OWNER TO zastra_user;
ALTER LARGE OBJECT 51024 OWNER TO zastra_user;
ALTER LARGE OBJECT 51025 OWNER TO zastra_user;
ALTER LARGE OBJECT 51030 OWNER TO zastra_user;
ALTER LARGE OBJECT 51031 OWNER TO zastra_user;
ALTER LARGE OBJECT 51032 OWNER TO zastra_user;
ALTER LARGE OBJECT 51033 OWNER TO zastra_user;
ALTER LARGE OBJECT 51034 OWNER TO zastra_user;
ALTER LARGE OBJECT 51035 OWNER TO zastra_user;
ALTER LARGE OBJECT 51036 OWNER TO zastra_user;
ALTER LARGE OBJECT 51037 OWNER TO zastra_user;
ALTER LARGE OBJECT 51038 OWNER TO zastra_user;
ALTER LARGE OBJECT 51039 OWNER TO zastra_user;
ALTER LARGE OBJECT 51040 OWNER TO zastra_user;
ALTER LARGE OBJECT 51041 OWNER TO zastra_user;
ALTER LARGE OBJECT 51042 OWNER TO zastra_user;
ALTER LARGE OBJECT 51043 OWNER TO zastra_user;
ALTER LARGE OBJECT 51044 OWNER TO zastra_user;
ALTER LARGE OBJECT 51045 OWNER TO zastra_user;
ALTER LARGE OBJECT 51046 OWNER TO zastra_user;

--
-- TOC entry 5044 (class 0 OID 26039)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.users (id, created_at, email, enabled, first_name, last_name, password, user_role, updated_at, account_non_expired, account_non_locked, credentials_non_expired, email_verified, house_number, postal_code, street_name, date_of_birth, gender, national_id, phone_number, city, province, avatar_url, last_login, google_id, facebook_id) FROM stdin;
30	2025-09-10 19:00:10.510777+02	lindaria.purba@zastra.com	t	Lindaria	Purba	$2a$12$TN7cvd3xvXEtkrl1mXhK.u1Mjk1M9bDPN0NRurfzulxrGRlYEM2pq	ADMIN	2025-11-29 19:03:19.203661+01	t	t	t	t	1A	30050	Gov Street	1985-02-15	female	ADM9876543210	+31655556666	Grand Wisata	West Bekasi	http://localhost:8080/media/avatars/c283645f-2d6d-4cef-810a-69966cdc0148.png	2025-11-29 19:03:19.202292	\N	\N
29	2025-09-10 18:58:27.268445+02	roy@example.com	t	Roy	Anderson	$2a$12$iND0lVG..3J2AvYyfMTaee37JTxChrVTKL4y6BTKZXMEcEllTKpy.	CITIZEN	2025-11-29 19:04:13.110719+01	t	t	t	t	5A	12345	Main Street	1990-05-01	male	1234567890123456	+31611112222	Bantar Gebang	Cikarang	/images/default/male.png	2025-11-29 19:04:13.110719	\N	\N
33	2025-09-10 22:50:32.574229+02	bob.johnson@example.com	t	Bob	Johnson	$2a$12$qrQ9rWudZoSR5QXOf4aGB.wK0tW9XCLY4Dn2k3NJfLZYhVP8grLfO	CITIZEN	2025-11-28 00:07:34.222539+01	t	t	t	t	25	20221	Oak Avenue	1985-11-05	male	7758932816543879	+31687654321	Pekayon Jaya	South Bekasi	/images/default/male.png	2025-11-28 00:07:34.221537	\N	\N
31	2025-09-10 19:01:52.619757+02	oscar.polman@zastra.com	t	Oscar	Polman	$2a$12$cLSSw58.mk4bgynQ6qRk8uB8O85bu57CjKSNwr1jsMF7xzPmMgq12	OFFICER	2025-11-27 23:18:49.052943+01	t	t	t	t	12B	20010	Justice Street	1988-07-22	male	OFI1234567890	+31633334444	Grand Wisata	West Bekasi	/images/default/male.png	2025-11-27 23:18:49.051939	\N	\N
42	2025-10-23 18:04:50.65266+02	sinaga.afriani88@gmail.com	t	Afriani	Sinaga	$2a$12$pu1takviUI2QwMv/3/nYDue.4XF28PU4m/en6R.hnwHPcIAqYn6EC	CITIZEN	2025-11-26 12:00:39.256532+01	t	t	t	t	14	17145	Pakis Raya	1988-04-14	Female	9997778884445551	+31626728811	Bekasi	South Bekasi	http://localhost:8080/media/avatars/4fdeaf7e-6245-4976-9888-dac355a1a5b9.jpg	2025-11-26 12:00:39.255508	116753261995891003359	10231690747757357
32	2025-09-10 19:49:00.420446+02	alice.smith@example.com	t	Alice	Smith	$2a$12$92uXtnZ1gJ2O9uuLZLhN8ugKliNXnaMA3Z0ZkdRtmUHo8dMXysc76	CITIZEN	2025-11-27 23:01:27.794919+01	t	t	t	t	10	10115	Main Street	1992-03-20	female	9876543210987654	+31612345678	Jatiasih	South Bekasi	/images/default/female.png	2025-11-27 23:01:27.794919	\N	\N
36	2025-09-17 01:00:15.840039+02	eva.green@zastra.com	t	Eva	Green	$2a$12$Srpct8qB5QmM.AGWsW1puO3dUpkjuS1dWOv7M7j7JFpGvGZTMKzPm	OFFICER	2025-11-30 17:37:25.09738+01	t	t	t	t	7	17148	Pakis Raya	1988-06-10	Female	OFI123456789012	1234567890	Bekasi	Pekayon Jaya	http://localhost:8080/media/avatars/160ffd11-2827-4e42-84ab-3c5c7b50aac4.png	2025-11-30 17:37:25.096379	\N	\N
\.


--
-- TOC entry 5067 (class 0 OID 42672)
-- Dependencies: 243
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.announcements (id, title, content, created_by_admin_id, is_urgent, is_active, created_at, updated_at, end_at, is_pinned, start_at, visibility) FROM stdin;
18	WARM WELCOME	Dear (new) members,\n\nWelcom to Zastra. Welcome to a platform that you could report all damaged public facilities that concern your own safety and other people's safety. Please, we would like to invite you to read carefully about out rules to report and our rules for your own data privacy.\n\nOnce again we welcome you all and we wish you all a wonderful day ahead.\n\n\nKindly regards,\nZastra Team	30	f	t	2025-10-09 00:42:38.220216	2025-11-26 09:33:35.501656	\N	f	\N	ALL
30	NEW REPORTING FEATURE	Dear officers,\n\nWe'll be launching a new Reporting Feature this morning. In order to learn how to use it, you must send me your employee's number. Afterwards, I'll send you a learning link.\n\nIf you have any other questions or inputs towards our new feature, please don't hesitate to contact me. Looking forward to hearing from you all.\n\n\nBest regards,\nLinda	30	f	t	2025-11-26 11:03:25.05761	2025-11-26 11:03:25.05761	\N	f	\N	OFFICERS
19	MAINTENANCE	Dear all users,\n\nPlease be informed that Zastra will be temporarily unavailable due to scheduled maintenance from **Friday, 7 November at 7 PM** until **Sunday, 9 November at 12 PM**.\n\nIf you have any questions or need assistance during this period, please don’t hesitate to contact us at: info.zastra@gmail.com.\n\nWe sincerely apologize for any inconvenience this may cause and appreciate your understanding.\n\n\nBest regards,\nZastra Team	30	f	f	2025-11-07 15:42:32.278891	2025-11-26 12:48:21.976605	\N	f	\N	ALL
33	APP DEVELOPMENT	Dear users,\n\nWe're gonna have some app development and it can cause the productivity of using the platform. The development will take approx. five working days.\n\nTherefore if you have any problem with using our platform, do not hesitate to contact me or our team in the email address: info.zastra@gmail.com.\n\nAlso, we're hoping more of your understanding and patience. We'll do our best to make the development process faster than we've aleady planned.\n\nLastly, we wish you a great day!\n\n\nBest regards,\nAdmin & Zastra Team	30	f	t	2025-11-26 12:10:35.064666	2025-11-26 13:17:57.385763	\N	f	\N	ALL
\.


--
-- TOC entry 5069 (class 0 OID 42692)
-- Dependencies: 245
-- Data for Name: announcement_read_status; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.announcement_read_status (id, announcement_id, officer_id, read, created_at, updated_at) FROM stdin;
2	18	36	t	2025-10-09 00:43:52.359291	2025-10-09 00:43:52.359291
3	18	31	t	2025-11-07 15:49:19.222853	2025-11-07 15:49:19.222853
\.


--
-- TOC entry 5071 (class 0 OID 50985)
-- Dependencies: 247
-- Data for Name: app_notifications; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.app_notifications (id, user_id, type, title, message, related_id, is_read, created_at) FROM stdin;
43	32	STATUS_UPDATE	Report Status Updated	Your report "Falling Tree at Main Road" status changed to In Review	29	t	2025-11-21 15:03:23.234142
295	31	ANNOUNCEMENT	📢 NEW REPORTING FEATURE	Dear officers,\n\nWe'll be launching a new Reporting Feature this morning. In order to learn how to use it, you must send me your employee's number. Afterwards, I'll send you a learning link.\n\nIf you have any other questions or inputs towards our new feature, please don't hesitate to contact me. Looking forward to hearing from you all.\n\n\nBest regards,\nLinda	30	f	2025-11-26 11:03:25.082817
296	36	ANNOUNCEMENT	📢 NEW REPORTING FEATURE	Dear officers,\n\nWe'll be launching a new Reporting Feature this morning. In order to learn how to use it, you must send me your employee's number. Afterwards, I'll send you a learning link.\n\nIf you have any other questions or inputs towards our new feature, please don't hesitate to contact me. Looking forward to hearing from you all.\n\n\nBest regards,\nLinda	30	f	2025-11-26 11:03:25.08583
50	31	MESSAGE	New message in conversation #11	Dear Oscar,\n\nWhat a good news! Finally my report is being under the review. I'm looking forward to hearing from you.\n\nBe...	11	t	2025-11-24 22:27:55.850866
294	30	ANNOUNCEMENT	📢 NEW REPORTING FEATURE	Dear officers,\n\nWe'll be launching a new Reporting Feature this morning. In order to learn how to use it, you must send me your employee's number. Afterwards, I'll send you a learning link.\n\nIf you have any other questions or inputs towards our new feature, please don't hesitate to contact me. Looking forward to hearing from you all.\n\n\nBest regards,\nLinda	30	t	2025-11-26 11:03:25.073762
49	29	MESSAGE	New message in conversation #11	Dear Roy,\n\nFirst of all, thank you for your message. Your report is currently being reviews. If there's any update, I'll...	11	t	2025-11-24 15:08:16.046786
250	42	STATUS_UPDATE	Report Status Updated	Your report "Road Damage and Potholes" status changed to In Progress	26	f	2025-11-25 23:20:27.041602
209	30	MESSAGE	New message in conversation #25	Hi Linda,\n\nThank you for your email. I'd like to have a meeting tomorrow at 10AM. Would it be okay for you?\n\nRegards,\nEv...	25	t	2025-11-25 13:51:45.671789
45	42	STATUS_UPDATE	Report Status Updated	Your report "A Broken Traffic Light" status changed to In Review	25	t	2025-11-24 02:50:54.608194
252	31	STATUS_UPDATE	Report Status Updated	Report #26 "Road Damage and Potholes" status changed to In Progress by Eva Green	26	f	2025-11-25 23:20:27.052218
251	30	STATUS_UPDATE	Report Status Updated	Report #26 "Road Damage and Potholes" status changed to In Progress by Eva Green	26	t	2025-11-25 23:20:27.050207
253	36	STATUS_UPDATE	Report Status Updated	Report #26 "Road Damage and Potholes" status changed to In Progress by Eva Green	26	t	2025-11-25 23:20:27.054743
44	32	STATUS_UPDATE	Report Status Updated	Your report "Damaged Public Bench" status changed to In Progress	24	t	2025-11-21 18:43:58.71226
254	30	STATUS_UPDATE	Report Status Updated	Your report "Road Damage and Potholes" status changed to In Progress	26	f	2025-11-25 23:20:27.070334
255	31	STATUS_UPDATE	Report Status Updated	Your report "Road Damage and Potholes" status changed to In Progress	26	f	2025-11-25 23:20:27.071335
257	29	STATUS_UPDATE	Report Status Updated	Your report "Damage Traffic Light" status changed to In Review	30	f	2025-11-25 23:25:32.763149
258	30	STATUS_UPDATE	Report Status Updated	Report #30 "Damage Traffic Light" status changed to In Review by Eva Green	30	f	2025-11-25 23:25:32.770921
210	36	MESSAGE	New message in conversation #25	Hi Eva,\n\nYes, that wouldn't be a problem for me. I'll reserve a meeting room from 10AM to 11AM. An hour would be enough ...	25	t	2025-11-25 13:54:12.993269
259	31	STATUS_UPDATE	Report Status Updated	Report #30 "Damage Traffic Light" status changed to In Review by Eva Green	30	f	2025-11-25 23:25:32.772938
260	36	STATUS_UPDATE	Report Status Updated	Report #30 "Damage Traffic Light" status changed to In Review by Eva Green	30	f	2025-11-25 23:25:32.774946
261	30	STATUS_UPDATE	Report Status Updated	Your report "Damage Traffic Light" status changed to In Review	30	f	2025-11-25 23:25:32.78668
262	31	STATUS_UPDATE	Report Status Updated	Your report "Damage Traffic Light" status changed to In Review	30	f	2025-11-25 23:25:32.787781
211	30	MESSAGE	New message in conversation #25	Hi Linda,\n\nThanks for your quick respond. Yes, one hour would be enough. Thanks and see you tomorrow!\n\nRegads,\nEva	25	t	2025-11-25 13:55:51.746798
46	33	STATUS_UPDATE	Report Status Updated	Your report "A Broken Playground" status changed to In Review	27	t	2025-11-24 02:52:05.469576
263	36	STATUS_UPDATE	Report Status Updated	Your report "Damage Traffic Light" status changed to In Review	30	f	2025-11-25 23:25:32.788825
264	42	STATUS_UPDATE	Report Status Updated	Your report "A Broken Traffic Light" status changed to In Progress	25	f	2025-11-25 23:27:29.027759
265	30	STATUS_UPDATE	Report Status Updated	Report #25 "A Broken Traffic Light" status changed to In Progress by Eva Green	25	f	2025-11-25 23:27:29.030778
266	31	STATUS_UPDATE	Report Status Updated	Report #25 "A Broken Traffic Light" status changed to In Progress by Eva Green	25	f	2025-11-25 23:27:29.032801
267	36	STATUS_UPDATE	Report Status Updated	Report #25 "A Broken Traffic Light" status changed to In Progress by Eva Green	25	f	2025-11-25 23:27:29.033804
268	30	STATUS_UPDATE	Report Status Updated	Your report "A Broken Traffic Light" status changed to In Progress	25	f	2025-11-25 23:27:29.041565
270	36	STATUS_UPDATE	Report Status Updated	Your report "A Broken Traffic Light" status changed to In Progress	25	f	2025-11-25 23:27:29.044725
256	36	STATUS_UPDATE	Report Status Updated	Your report "Road Damage and Potholes" status changed to In Progress	26	t	2025-11-25 23:20:27.07337
269	31	STATUS_UPDATE	Report Status Updated	Your report "A Broken Traffic Light" status changed to In Progress	25	t	2025-11-25 23:27:29.043718
208	36	MESSAGE	New message in conversation #25	[Report #32] Hi Eva,\n\nHow is it going so far for the repot #32: Cable on Main Street. It's been more than seven week and...	25	t	2025-11-25 13:49:28.54758
329	29	ANNOUNCEMENT	📢 APP DEVELOPMENT	Dear users,\n\nWe're gonna have some app development and it can cause the productivity of using the platform. The development will take approx. five working days.\n\nTherefore if you have any problem with using our platform, do not hesitate to contact me or our team in the email address: info.zastra@gmail.com.\n\nAlso, we're hoping more of your understanding and patience. We'll do our best to make the development process faster than we've aleady planned.\n\nLastly, we wish you a great day!\n\n\nBest regards,\nAdmin & Zastra Team	33	t	2025-11-26 12:10:35.091127
328	33	ANNOUNCEMENT	📢 APP DEVELOPMENT	Dear users,\n\nWe're gonna have some app development and it can cause the productivity of using the platform. The development will take approx. five working days.\n\nTherefore if you have any problem with using our platform, do not hesitate to contact me or our team in the email address: info.zastra@gmail.com.\n\nAlso, we're hoping more of your understanding and patience. We'll do our best to make the development process faster than we've aleady planned.\n\nLastly, we wish you a great day!\n\n\nBest regards,\nAdmin & Zastra Team	33	t	2025-11-26 12:10:35.083551
330	31	ANNOUNCEMENT	📢 APP DEVELOPMENT	Dear users,\n\nWe're gonna have some app development and it can cause the productivity of using the platform. The development will take approx. five working days.\n\nTherefore if you have any problem with using our platform, do not hesitate to contact me or our team in the email address: info.zastra@gmail.com.\n\nAlso, we're hoping more of your understanding and patience. We'll do our best to make the development process faster than we've aleady planned.\n\nLastly, we wish you a great day!\n\n\nBest regards,\nAdmin & Zastra Team	33	f	2025-11-26 12:10:35.093139
332	32	ANNOUNCEMENT	📢 APP DEVELOPMENT	Dear users,\n\nWe're gonna have some app development and it can cause the productivity of using the platform. The development will take approx. five working days.\n\nTherefore if you have any problem with using our platform, do not hesitate to contact me or our team in the email address: info.zastra@gmail.com.\n\nAlso, we're hoping more of your understanding and patience. We'll do our best to make the development process faster than we've aleady planned.\n\nLastly, we wish you a great day!\n\n\nBest regards,\nAdmin & Zastra Team	33	f	2025-11-26 12:10:35.097964
333	42	ANNOUNCEMENT	📢 APP DEVELOPMENT	Dear users,\n\nWe're gonna have some app development and it can cause the productivity of using the platform. The development will take approx. five working days.\n\nTherefore if you have any problem with using our platform, do not hesitate to contact me or our team in the email address: info.zastra@gmail.com.\n\nAlso, we're hoping more of your understanding and patience. We'll do our best to make the development process faster than we've aleady planned.\n\nLastly, we wish you a great day!\n\n\nBest regards,\nAdmin & Zastra Team	33	f	2025-11-26 12:10:35.099973
334	36	ANNOUNCEMENT	📢 APP DEVELOPMENT	Dear users,\n\nWe're gonna have some app development and it can cause the productivity of using the platform. The development will take approx. five working days.\n\nTherefore if you have any problem with using our platform, do not hesitate to contact me or our team in the email address: info.zastra@gmail.com.\n\nAlso, we're hoping more of your understanding and patience. We'll do our best to make the development process faster than we've aleady planned.\n\nLastly, we wish you a great day!\n\n\nBest regards,\nAdmin & Zastra Team	33	f	2025-11-26 12:10:35.102069
\.


--
-- TOC entry 5063 (class 0 OID 42523)
-- Dependencies: 239
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.conversations (id, created_at, subject, updated_at) FROM stdin;
8	2025-10-06 15:30:31.569603+02	Litter on Main Road	2025-10-06 15:30:31.601058+02
10	2025-10-06 22:44:29.892076+02	Update from my complaint (Litter on Main Road)	2025-10-06 22:44:29.896277+02
9	2025-10-06 15:32:28.359789+02	Litters on the Main Road	2025-10-30 23:56:58.841111+01
13	2025-11-24 02:45:25.246226+01	Update my Report: Cable on the Main Street	2025-11-24 02:49:32.962067+01
14	2025-11-24 11:36:11.462124+01	Update on My Report	2025-11-24 11:46:24.3811+01
15	2025-11-24 13:51:37.224518+01	Updated for my Report #24	2025-11-24 14:19:55.563169+01
12	2025-11-23 23:00:26.538113+01	Update my Report & Email: Unethical Graffiti	2025-11-24 14:31:03.359425+01
11	2025-11-21 21:27:44.05749+01	Update my Report: Unethical Graffiti	2025-11-24 22:27:55.845497+01
25	2025-11-25 13:49:28.537275+01	Report: Cable on Main Street	2025-11-25 13:55:51.745795+01
\.


--
-- TOC entry 5060 (class 0 OID 42512)
-- Dependencies: 236
-- Data for Name: conversation_messages; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.conversation_messages (id, content, created_at, read, conversation_id, sender_id) FROM stdin;
9	42766	2025-10-06 15:32:28.36179+02	t	9	36
8	42767	2025-10-06 15:30:31.58583+02	t	8	36
10	42769	2025-10-06 22:37:40.528617+02	t	9	33
11	42771	2025-10-06 22:44:29.893103+02	t	10	33
12	50969	2025-10-30 23:51:47.923926+01	t	9	33
16	51005	2025-11-24 02:45:25.279353+01	t	13	32
13	51007	2025-10-30 23:56:58.836992+01	t	9	36
18	51009	2025-11-24 11:36:11.481013+01	t	14	33
19	51010	2025-11-24 11:46:24.366439+01	f	14	36
20	51012	2025-11-24 13:51:37.252616+01	t	15	32
17	51013	2025-11-24 02:49:32.958959+01	t	13	31
21	51014	2025-11-24 14:19:55.536047+01	f	15	31
15	51015	2025-11-23 23:00:26.551563+01	t	12	29
14	51021	2025-11-21 21:27:44.082345+01	t	11	29
26	51023	2025-11-24 15:08:16.032357+01	t	11	31
22	51025	2025-11-24 14:31:03.356964+01	t	12	31
27	51032	2025-11-24 22:27:55.82785+01	t	11	29
38	51042	2025-11-25 13:49:28.541075+01	t	25	30
39	51043	2025-11-25 13:51:45.667198+01	f	25	36
40	51045	2025-11-25 13:54:12.991259+01	t	25	30
41	51046	2025-11-25 13:55:51.744789+01	f	25	36
\.


--
-- TOC entry 5061 (class 0 OID 42517)
-- Dependencies: 237
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.conversation_participants (conversation_id, user_id) FROM stdin;
8	33
8	36
9	36
9	33
10	36
10	33
11	29
11	31
12	29
12	31
13	31
13	32
14	33
14	36
15	32
15	31
25	30
25	36
\.


--
-- TOC entry 5042 (class 0 OID 26033)
-- Dependencies: 218
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.email_verification_tokens (id, expires_at, token, user_id) FROM stdin;
\.


--
-- TOC entry 5050 (class 0 OID 26086)
-- Dependencies: 226
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.reports (id, address, category, created_at, description, latitude, longitude, status, title, updated_at, user_id, video_url, officer_id, city, house_number, postal_code, province, street_name, resolved_at) FROM stdin;
27	\N	DAMAGED_PLAYGROUND	2025-11-05 16:54:08.265134	We're choosing to live in Harapan Baru because of the playground for our children. It has been a few months the playground in bad condition and nothing is changed. Please, take a serious solution of this because all children are missing to play at this playground. We're looking forward to it.	-6.213442384285219	107.02103280104974	IN_REVIEW	A Broken Playground	2025-11-24 02:52:05.465574	33	\N	36	Bekasi	7	17121	West Java	Jalan Duta Bulevar Barat	\N
20	\N	LITTER	2025-10-03 09:03:44.12986	There are so many wastes already in the weeks lying on the left side of the main road. It smells really bad and pollutes air very much. Please, take a serious action about it!\n\n\n	-6.262883662466328	106.98688566684724	RESOLVED	Litters on Main Road	2025-10-08 08:53:58.580377	33	\N	36	Bekasi	17A	17148	West Java	Jalan Pekayon Raya	2025-10-08 08:53:58.580377
24	\N	BROKEN_BENCH	2025-11-05 11:38:19.163706	There are a lot of benches around the Patriot Stadion are in the poor condition. Stadion's actively still being use and unfortunately its facilities aren't in the proper condition. I'm hoping by reporting it there'll be a concrete action to fix it. 	-6.237065836098519	106.9925509404253	IN_PROGRESS	Damaged Public Bench	2025-11-21 18:43:58.68376	32	\N	31	Bekasi	7	17144	West Java	Jalan Ahmad Yani	\N
26	\N	ROAD_DAMAGE	2025-11-05 16:22:16.472112	I'm using this main road every morning and the road hasn't been in the good quality for more than five years. Could we count our local government to take a serious action to fix it? I'm looking forward to hearing from you.	-6.261909649818423	107.02113202529978	IN_PROGRESS	Road Damage and Potholes	2025-11-25 23:20:27.027183	42	\N	36	Lambangsari	7	17510	West Java	Jalan Inspeksi Kalimalang	\N
21	\N	ROAD_DAMAGE	2025-11-04 14:27:56.007991	The main road is being severe damage for a couple of years and it has never been fixed since then. The area has potential to have floods during rainy season and it is so dangerous for all the road users are passing this road. It's so concerning and indeed needs to a real solution. Hopefully seeing any changing pretty soon.	-6.2415367415658	107.01494889103316	IN_PROGRESS	Damaged Road	2025-11-05 19:10:33.899525	29	\N	36	Bekasi	7	10350	West Java	Jalan H. Nonon Sonthanie	\N
30	\N	BROKEN_STREETLIGHT	2025-11-07 14:52:02.698511	Please, do something to fix the broken traffic light since we all depend on that. I'm looking forward to hearing for my concern.	-6.241079105687756	107.00369888098342	IN_REVIEW	Damage Traffic Light	2025-11-25 23:25:32.758152	29	\N	36	Bekasi	7	17141	West Java	Jalan Insinyur Haji Juanda	\N
28	\N	GRAFFITI	2025-11-05 18:56:56.329904	I was yesterday's evening walking on this road and found this unethical graffiti on the wall beside the main road. Please, do something about this. Therefore, our public space would become more positive and cleaner.	-6.279691305613574	106.97185208899155	SUBMITTED	Unethical Graffiti	\N	29	\N	31	Bekasi	7	17147	West Java	Jalan Pekayon Raya	\N
25	\N	BROKEN_STREETLIGHT	2025-11-05 16:13:07.8141	I rode my auto passing this broken street light at yesterday's morning. And today's morning it's still dysfunctional and caused a long traffic jam. I was stuck almost 2 hours in the traffic jam. Could it be fixed soon since it cause so much trouble for everyone?	-6.242955004870267	106.97077160194453	IN_PROGRESS	A Broken Traffic Light	2025-11-25 23:27:29.02266	42	\N	36	Bekasi	7	17136	West Java	Jakapermai	\N
22	\N	POTHOLE	2025-11-04 14:41:42.831095	There are so many potholes on the verge of the road and on the pedestrian paths. This has stayed for more than five years and we haven't seen any actions from our local government to fix it. This is dangerous during the night because we all know that the lighting system is very poor. I also saw some accidents that the kids and adults have fallen to the holes. This is really concerning and hopefully there'll be a real act to fix this. Therefore, the pedestrian paths are safe to be used. 	-6.234847442581016	106.99680181958081	RESOLVED	Potholes at Pedestrian Path	2025-11-05 19:41:06.79628	32	\N	31	Bekasi	7	17143	West Java	Jalan Pintu Air Raya	2025-11-05 19:41:06.79628
23	\N	ILLEGAL_DUMPING	2025-11-04 17:39:52.269918	I have been using this main road mainly going to my work with the motorcycle and have noticed people keep dumping and burning their litter beside of this road. Every evening when I was riding my motorcycle to go home there was always ticked smokes coming from the burning litters. The smokes blocked the clear my view to ride safely. This is so dangerous and I heard this has happened already such a long time. Please, take a good action to clean the place and perhaps by installing security cameras will stop the illegal dumping and burning the litter. Please, take a serious action about it!	-6.205022931882058	106.95110896730354	IN_PROGRESS	Illegal Dumping and Burning Litters	2025-11-05 19:45:35.573698	42	\N	31	East Jakarta	7	41581	Java	Pulo Gebang	\N
31	\N	OTHER	2025-11-07 15:00:23.156772	My kids and I use this path every morning to their school and every rainy season my kid is fallen from this holes. The holes covers by flood and we couldn't see clearly where the holes are. Please, do something about it!!! This is so dangerous not only for my kids and I, but also for everyone passing this path!	-6.252346911213962	107.0138422655836	SUBMITTED	Ugly Pedestrian Path	\N	33	\N	36	Bekasi	7	17113	West Java	Kp Belter	\N
32	\N	OTHER	2025-11-07 15:17:22.657396	For a couple days in our community we're having the newest fiber optic cables installment. After a week of work installment they let the cable lies at the main road which is dangerous and costs everybody's safety especially there is a school around. Please, DO SOMETHING TO FIX IT !!! This is a serious concern and will be taking seriously. We're hoping tomorrow the cables are gone!	-6.271993447104131	106.98749121447513	SUBMITTED	Electric Cables Lie on Main Road	\N	32	\N	36	Bekasi	7	17114	West Java	Jalan Niaga Pratama 2	\N
29	\N	FALLEN_TREE	2025-11-06 23:15:35.403436	In the evening we had a pretty bad storm and the thunder hit one of the trees. It's now lying on the street and has been lying for four hours without any solutions. Could you find the solution so then it doesn't cause a long traffic?	-6.261422764130188	106.9851400605719	IN_REVIEW	Falling Tree at Main Road	2025-11-21 15:03:23.208959	32	\N	31	Bekasi	7	17148	West Java	Jalan Permata 3	\N
\.


--
-- TOC entry 5065 (class 0 OID 42619)
-- Dependencies: 241
-- Data for Name: inbox_items; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.inbox_items (id, created_at, message, read, officer_id, report_id, is_read) FROM stdin;
3	2025-10-03 09:03:44.226849	New report submitted: Litters on Main Road	f	36	20	f
4	2025-11-04 14:27:56.105812	New report submitted: Damaged Road	f	36	21	f
5	2025-11-04 14:41:42.853532	New report submitted: Potholes at Pedestrian Path	f	31	22	f
6	2025-11-04 17:39:52.30568	New report submitted: Illegal Dumping and Burning Litters	f	31	23	f
7	2025-11-05 11:38:19.199083	New report submitted: Damaged Public Bench	f	31	24	f
8	2025-11-05 16:13:07.846835	New report submitted: A Broken Traffic Light	f	36	25	f
9	2025-11-05 16:22:16.518842	New report submitted: Road Damage and Potholes	f	36	26	f
10	2025-11-05 16:54:08.283647	New report submitted: A Broken Playground	f	36	27	f
11	2025-11-05 18:56:56.398901	New report submitted: Unethical Graffiti	f	31	28	f
12	2025-11-06 23:15:35.45185	New report submitted: Falling Tree at Main Road	f	31	29	f
13	2025-11-07 14:52:02.738929	New report submitted: Damage Traffic Light	f	36	30	f
14	2025-11-07 15:00:23.174693	New report submitted: Ugly Pedestrian Path	f	36	31	f
15	2025-11-07 15:17:22.670817	New report submitted: Electric Cables Lie on Main Road	f	36	32	f
\.


--
-- TOC entry 5046 (class 0 OID 26070)
-- Dependencies: 222
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.messages (id, content, created_at, read, report_id, sender_id, deleted_by_admin, deleted_by_recipient, recipient_id) FROM stdin;
\.


--
-- TOC entry 5048 (class 0 OID 26078)
-- Dependencies: 224
-- Data for Name: report_images; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.report_images (id, file_name, file_path, file_size, file_type, report_id, image_url, video_duration, video_url) FROM stdin;
13	Sampah di Jalan Bekasi.png	http://localhost:8080/media/24	825061	image/png	20	http://localhost:8080/media/24	\N	\N
14	Jalan_Raya_Bekasi_Rusak_dan_Berlubang_Ancam_Keselamatan_Pengendara-IQBAL_2.png	http://localhost:8080/media/53	1464724	image/png	21	http://localhost:8080/media/53	\N	\N
15	Jalan berlubang 2.png	http://localhost:8080/media/54	257238	image/png	22	http://localhost:8080/media/54	\N	\N
16	bakar sampah di bekasi.png	http://localhost:8080/media/55	326645	image/png	23	http://localhost:8080/media/55	\N	\N
17	Broken Bench 1.jpg	http://localhost:8080/media/56	74197	image/jpeg	24	http://localhost:8080/media/56	\N	\N
18	Damaged Traffic Lights 2.jpeg	http://localhost:8080/media/57	19946	image/jpeg	25	http://localhost:8080/media/57	\N	\N
19	065969900_1678794046-Jalan_Raya_Bekasi_Rusak_dan_Berlubang_Ancam_Keselamatan_Pengendara-IQBAL_5.png	http://localhost:8080/media/58	1573793	image/png	26	http://localhost:8080/media/58	\N	\N
20	Damaged Playground 1.jpg	http://localhost:8080/media/59	253548	image/jpeg	27	http://localhost:8080/media/59	\N	\N
21	Graffiti.png	http://localhost:8080/media/60	1219625	image/png	28	http://localhost:8080/media/60	\N	\N
22	Fallen Tree 1.jpg	http://localhost:8080/media/62	123253	image/jpeg	29	http://localhost:8080/media/62	\N	\N
23	Damage Traffic Light.png	http://localhost:8080/media/63	211385	image/png	30	http://localhost:8080/media/63	\N	\N
24	Damage Pedestrian Path.jpg	http://localhost:8080/media/64	135180	image/jpeg	31	http://localhost:8080/media/64	\N	\N
25	Cables lie on the road.jpg	http://localhost:8080/media/65	90994	image/jpeg	32	http://localhost:8080/media/65	\N	\N
\.


--
-- TOC entry 5056 (class 0 OID 42487)
-- Dependencies: 232
-- Data for Name: report_media_entity; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.report_media_entity (id, url, video, report_id) FROM stdin;
\.


--
-- TOC entry 5058 (class 0 OID 42493)
-- Dependencies: 234
-- Data for Name: report_status_history; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.report_status_history (id, notes, status, "timestamp", updated_by, report_id, resolved_photo_url) FROM stdin;
26	Thank you for your report. We're going to review your report and location.	IN_REVIEW	2025-10-03 09:05:38.214536	eva.green@example.com	20	\N
27	We've had some meetings regarding this issues for the future actions and solutions because we're hoping that this won't be happening again. We'll let you know if there's an update.	IN_PROGRESS	2025-10-03 09:07:06.232737	eva.green@example.com	20	\N
31	We've cleared out the wastes and have installed security cameras to monitor the location. We'll send our workers every day to clean and monitor this place. Thank you for your report.	RESOLVED	2025-10-08 08:53:58.689629	Eva Green	20	http://localhost:8080/media/32
32	Status updated	IN_REVIEW	2025-11-04 23:10:58.111518	Eva Green	21	\N
33	Status updated	IN_REVIEW	2025-11-04 23:12:27.987144	Oscar Polman	22	\N
34	Status updated	IN_REVIEW	2025-11-05 19:05:27.477152	Eva Green	26	\N
35	Status updated	IN_PROGRESS	2025-11-05 19:06:49.539599	Oscar Polman	22	\N
36	Status updated	IN_REVIEW	2025-11-05 19:07:45.264538	Oscar Polman	23	\N
37	Status updated	IN_PROGRESS	2025-11-05 19:10:33.899525	Eva Green	21	\N
38	Thank you for your report. The issue has been taken seriously, and necessary actions have been completed. The road has been repaired, and the orange barrier has been removed. We appreciate your contribution in helping us maintain a safer environment for everyone. Finally if you've any questions, please don't hesitate to contact us in this email address: info.zastra@gmail.com	RESOLVED	2025-11-05 19:41:06.872197	Oscar Polman	22	http://localhost:8080/media/61
39	First of all, thank you for your report. Your report is now under the process. We'll let you know if there's any update news.	IN_PROGRESS	2025-11-05 19:45:35.573698	Oscar Polman	23	\N
40	Thank you for your report. We're gonna review it. Best regards, Zastra Team	IN_REVIEW	2025-11-06 23:19:18.844137	Oscar Polman	24	\N
41	Status updated	IN_REVIEW	2025-11-21 15:03:23.208959	Oscar Polman	29	\N
42	Your report is already being scheduled and we'll send our employees to fix it. We'll update it as soon as it's been fixed. Greeting, Zastra Team.	IN_PROGRESS	2025-11-21 18:43:58.68376	Oscar Polman	24	\N
43	Status updated	IN_REVIEW	2025-11-24 02:50:54.58979	Eva Green	25	\N
44	Thank you for your report. We'll review your report as soon as possible.\r\n\r\nBest regards,\r\nEva Green	IN_REVIEW	2025-11-24 02:52:05.465574	Eva Green	27	\N
45	Dear Afriani, \r\n\r\nWe've scheduled the date and will send our team to fix the road.\r\n\r\nIf there's any update and new messages for the result, we'll upload it in here asap.\r\n\r\nBest regards,\r\nEva Green	IN_PROGRESS	2025-11-25 23:20:27.027183	Eva Green	26	\N
46	Dear Roy,\r\n\r\nFirst of all, thank you for your report. Excuses that we inform you pretty late. However we've received your report and will soon process it to the team to find any solutions.\r\n\r\nAt last, if you have any further questions don't hesitate to contact me or to our email address: info.zastra@gmail.com\r\n\r\nKindly regards,\r\nEva Green	IN_REVIEW	2025-11-25 23:25:32.758152	Eva Green	30	\N
47	Dear Afriani,\r\n\r\nWe've scheduled the date and will send our team to fix the traffic light.\r\n\r\nAny updated news and images will be uploaded asap.\r\n\r\nBest regards,\r\nEva Green	IN_PROGRESS	2025-11-25 23:27:29.02266	Eva Green	25	\N
\.


--
-- TOC entry 5052 (class 0 OID 26096)
-- Dependencies: 228
-- Data for Name: status_updates; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.status_updates (id, comment, created_at, new_status, previous_status, report_id, updated_by) FROM stdin;
\.


--
-- TOC entry 5054 (class 0 OID 26106)
-- Dependencies: 230
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: zastra_user
--

COPY public.verification_tokens (id, created_at, expired_date, token_number, user_id) FROM stdin;
\.


--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 244
-- Name: announcement_read_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.announcement_read_status_id_seq', 3, true);


--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 242
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.announcements_id_seq', 35, true);


--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 246
-- Name: app_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.app_notifications_id_seq', 348, true);


--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 235
-- Name: conversation_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.conversation_messages_id_seq', 41, true);


--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 238
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.conversations_id_seq', 25, true);


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 217
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.email_verification_tokens_id_seq', 3, true);


--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 240
-- Name: inbox_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.inbox_items_id_seq', 15, true);


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 221
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.messages_id_seq', 7, true);


--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 223
-- Name: report_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.report_images_id_seq', 25, true);


--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 231
-- Name: report_media_entity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.report_media_entity_id_seq', 1, false);


--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 233
-- Name: report_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.report_status_history_id_seq', 47, true);


--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 225
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.reports_id_seq', 32, true);


--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 227
-- Name: status_updates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.status_updates_id_seq', 1, false);


--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.users_id_seq', 73, true);


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 229
-- Name: verification_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zastra_user
--

SELECT pg_catalog.setval('public.verification_tokens_id_seq', 35, true);


--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 5072 5074
-- Data for Name: 42553..51046; Type: BLOBS; Schema: -; Owner: zastra_user
--

BEGIN;

SELECT pg_catalog.lo_open('42553', 131072);
SELECT pg_catalog.lowrite(0, '\x48656c6c6f2c207468697320697320612074657374206d657373616765');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('42554', 131072);
SELECT pg_catalog.lowrite(0, '\x48656c6c6f2c207468697320697320612074657374206d657373616765');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('42764', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202332305d205468616e6b20796f7520666f7220796f7572207265706f72742e20576527726520676f6e6e61207461636b207468652070726f626c656d207468617420796f75277665207265706f727465642e20417320736f6f6e20617320776527766520666f756e642074686520736f6c7574696f6e20746f776172647320796f7572207265706f7274207765276c6c2075706461746520697420736f6f6e2e2046696e616c6c792c2077652772652077697368696e6720796f75206120776f6e64657266756c206461792e0a0a4265737420726567617264732c0a5a617374726120637573746f6d65722d73657276696365207465616d');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('42765', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202332305d205468616e6b20796f7520666f7220796f7572207265706f72742e20576527726520676f6e6e61207461636b207468652070726f626c656d207468617420796f75277665207265706f727465642e20417320736f6f6e20617320776527766520666f756e642074686520736f6c7574696f6e20746f776172647320796f7572207265706f7274207765276c6c2075706461746520697420736f6f6e2e2046696e616c6c792c2077652772652077697368696e6720796f75206120776f6e64657266756c206461792e0a0a4265737420726567617264732c0a5a617374726120637573746f6d65722d73657276696365207465616d');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('42766', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202332305d205468616e6b20796f7520666f7220796f7572207265706f72742e20576527726520676f6e6e61207461636b207468652070726f626c656d207468617420796f75277665207265706f727465642e20417320736f6f6e20617320776527766520666f756e642074686520736f6c7574696f6e20746f776172647320796f7572207265706f7274207765276c6c2075706461746520697420736f6f6e2e2046696e616c6c792c2077652772652077697368696e6720796f75206120776f6e64657266756c206461792e0a0a4265737420726567617264732c0a5a617374726120637573746f6d65722d73657276696365207465616d');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('42767', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202332305d205468616e6b20796f7520666f7220796f7572207265706f72742e20576527726520676f6e6e61207461636b207468652070726f626c656d207468617420796f75277665207265706f727465642e20417320736f6f6e20617320776527766520666f756e642074686520736f6c7574696f6e20746f776172647320796f7572207265706f7274207765276c6c2075706461746520697420736f6f6e2e2046696e616c6c792c2077652772652077697368696e6720796f75206120776f6e64657266756c206461792e0a0a4265737420726567617264732c0a5a617374726120637573746f6d65722d73657276696365207465616d');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('42768', 131072);
SELECT pg_catalog.lowrite(0, '\x44656172207369722f6d6164616d2c207468616e6b20796f7520666f7220796f75206661737420726573706f6e736520746f7761726473206d79207265706f72742e2049276d206c6f6f6b696e6720666f727761726420746f2068656172696e672066726f6d20796f752e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('42769', 131072);
SELECT pg_catalog.lowrite(0, '\x44656172207369722f6d6164616d2c207468616e6b20796f7520666f7220796f75206661737420726573706f6e736520746f7761726473206d79207265706f72742e2049276d206c6f6f6b696e6720666f727761726420746f2068656172696e672066726f6d20796f752e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('42770', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202332305d2054776565207765656b732061676f204927766520726563656976656420796f7572206d65737361676520746f7761726473206d7920636f6d706c61696e207265706f72742e204920686f7065204920636f756c6420686561722074686174207468657265277320616c7265616479206120736f6c7574696f6e2773206265696e67206d6164652e2049276d206c6f6f6b696e6720666f727761726420746f2068656172696e672066726f6d20796f752e0a0a4265737420726567617264732c0a426f62204a6f686e736f6e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('42771', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202332305d2054776565207765656b732061676f204927766520726563656976656420796f7572206d65737361676520746f7761726473206d7920636f6d706c61696e207265706f72742e204920686f7065204920636f756c6420686561722074686174207468657265277320616c7265616479206120736f6c7574696f6e2773206265696e67206d6164652e2049276d206c6f6f6b696e6720666f727761726420746f2068656172696e672066726f6d20796f752e0a0a4265737420726567617264732c0a426f62204a6f686e736f6e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('50968', 131072);
SELECT pg_catalog.lowrite(0, '\x44656172206576612c0a0a4920736177206d79207265706f7274206973206265696e67206e6963656c792068616e646c65642e205468616e6b20796f7520666f7220796f75722066617374207265616374696f6e20616e642074616b65206d79207265706f727420696e746f20736572696f757320636f6e73696465726174696f6e20616e6420616374696f6e2e200a0a4265737420726567617264732c0a426f622e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('50969', 131072);
SELECT pg_catalog.lowrite(0, '\x44656172206576612c0a0a4920736177206d79207265706f7274206973206265696e67206e6963656c792068616e646c65642e205468616e6b20796f7520666f7220796f75722066617374207265616374696f6e20616e642074616b65206d79207265706f727420696e746f20736572696f757320636f6e73696465726174696f6e20616e6420616374696f6e2e200a0a4265737420726567617264732c0a426f622e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('50970', 131072);
SELECT pg_catalog.lowrite(0, '\x4465617220426f622c205468616e6b20796f7520666f7220796f757220666565646261636b2e204974277320616c77617973206e69636520746f20686561722074686520666565646261636b732e204f6620636f7572736520776520616c776179732074616b6520736572696f75736c79206576657279207265706f7274207468617420776527766520726563656976656420616e6420776f726b20616c7761797320696e2066696e64696e672074686520666173742c20656666696369656e742c20616e6420636f6e74696e756f757320736f6c7574696f6e2e204c6173746c792c20696620796f75206861766520616e79207175657374696f6e7320796f7520636f756c6420616c7761797320636f6e7461637420757320696e2068657265206f7220766961206f7572206f6666696369616c20656d61696c20616464726573733a20696e666f407a617374726140676d696c2e636f6d2e2049207769736820796f7520612062656175746966756c206461792e204265737420726567617264732c20457661202d205a6173747261205465616d');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51002', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202332385d2044656172204f736361722c2069742773206265656e2032207765656b732073696e6365204927766520706f73746564206d79207265706f72742061626f757420556e6574686963616c20477261666669746920616e64204920686176656e277420686561726420616e79206e657773207570646174652061626f75742069742e0a0a436f756c6420796f7520706c65617365206c6574206d65206b6e6f7720776861742773207468652075706461746564206e65777320666f722074686973207265706f727420285265706f727420233238292e0a0a49276d206c6f6f6b696e6720666f727761726420746f2068656172696e672066726f6d20796f752e0a0a0a4772656574696e67732c0a526f7920532e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51003', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202332385d2044656172204f736361722c2069742773206265656e2074776f207765656b7320666f72206d79207265706f727420616e642074776f20646179732073696e636520746865206c6173742074696d6520492073656e7420796f7520616e20656d61696c2e20556e74696c206e6f772049276d206e6f742068656172696e6720616e797468696e672066726f6d20796f752e20436f756c6420796f7520726573706f6e7365206d79207265706f727420616e6420656d61696c3f2e204265737420726567617264732c20526f79');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51004', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202333325d2044656172204f736361722c0a0a4920686176656e277420686561726420616e797468696e672061626f757420616e7920757064617465206e65777320746f77617264206d79207265706f72747320657370656369616c6c792061626f757420746865206361626c6573206c6965206f6e20746865206d61696e20726f61642e20546865206361626c65732068617665206265656e206c79696e6720746865726520666f7220616c6d6f73742061206d6f6e746820616e64206e6f626f647927732074616b696e67206361726520746f20636c65616e2069742075702e0a0a506c656173652c2074616b65206120736572696f757320616374696f6e2061626f757420746869732070726f626c656d2e0a0a0a4265737420726567617264732c0a416c696365');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51005', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202333325d2044656172204f736361722c0a0a4920686176656e277420686561726420616e797468696e672061626f757420616e7920757064617465206e65777320746f77617264206d79207265706f72747320657370656369616c6c792061626f757420746865206361626c6573206c6965206f6e20746865206d61696e20726f61642e20546865206361626c65732068617665206265656e206c79696e6720746865726520666f7220616c6d6f73742061206d6f6e746820616e64206e6f626f647927732074616b696e67206361726520746f20636c65616e2069742075702e0a0a506c656173652c2074616b65206120736572696f757320616374696f6e2061626f757420746869732070726f626c656d2e0a0a0a4265737420726567617264732c0a416c696365');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51006', 131072);
SELECT pg_catalog.lowrite(0, '\x4465617220416c6963652c0a0a4920616d206e6f74207375726520696620796f752772652061736b696e672074686520726967687420706572736f6e2e20596f7572207265706f727420697320676f696e6720746f206d79206f7468657220636f776f726b657220416c6963652e0a0a596f7520636f756c642073656e6420686572206d65737361676520766961207468697320656d61696c20616464726573733a206576612e677265656e407a61737472612e636f6d0a0a4920686f70652049206861766520696e666f726d656420796f7520636c6561726c792e0a0a0a4265737420726567617264732c0a4f7363617220506f6c6d616e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51007', 131072);
SELECT pg_catalog.lowrite(0, '\x4465617220426f622c205468616e6b20796f7520666f7220796f757220666565646261636b2e204974277320616c77617973206e69636520746f20686561722074686520666565646261636b732e204f6620636f7572736520776520616c776179732074616b6520736572696f75736c79206576657279207265706f7274207468617420776527766520726563656976656420616e6420776f726b20616c7761797320696e2066696e64696e672074686520666173742c20656666696369656e742c20616e6420636f6e74696e756f757320736f6c7574696f6e2e204c6173746c792c20696620796f75206861766520616e79207175657374696f6e7320796f7520636f756c6420616c7761797320636f6e7461637420757320696e2068657265206f7220766961206f7572206f6666696369616c20656d61696c20616464726573733a20696e666f407a617374726140676d696c2e636f6d2e2049207769736820796f7520612062656175746966756c206461792e204265737420726567617264732c20457661202d205a6173747261205465616d');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51008', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202333315d204869206576612c0a0a497420686173206265656e206d6f7265207468616e2074776f207765656b732066726f6d204920686176652073656e74206d79207265706f72742061626f7574207468652062696720686f6c6573206f6e20746865207065646573747269616e20706174682e20446f20796f75206865617220616e797468696e672061626f75742069743f2e0a0a49276d206c6f6f6b696e6720666f727761726420746f2068656172696e672066726f6d20796f752e0a0a4265737420726567617264732c0a426f62');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51009', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202333315d204869206576612c0a0a497420686173206265656e206d6f7265207468616e2074776f207765656b732066726f6d204920686176652073656e74206d79207265706f72742061626f7574207468652062696720686f6c6573206f6e20746865207065646573747269616e20706174682e20446f20796f75206865617220616e797468696e672061626f75742069743f2e0a0a49276d206c6f6f6b696e6720666f727761726420746f2068656172696e672066726f6d20796f752e0a0a4265737420726567617264732c0a426f62');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51010', 131072);
SELECT pg_catalog.lowrite(0, '\x486920426f622c200a0a4669727374206f6620616c6c2c207468616e6b20796f7520666f7220796f7572206d6573736167652e20596f7572207265706f727420686173206265656e2074616b656e20736f206c6f6e672062656361757365207765206861766520612073686f7274206f6620636f776f726b6572732064756520746f207369636b6e6573732e204e6f7720697427732067657474696e67206261636b20746f206e6f726d616c2c2049276c6c2075706461746520796f7520617320736f6f6e20617320706f737369626c652e200a0a4265737420726567617264732c20457661');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51011', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202332345d2044656172204f736361722c0a0a49742773206265656e206d6f7265207468616e2074776f207765656b732073696e6365204920686176652073656e74206d79207265706f72742e204861766520796f7520686561726420616e7920757064617465206e6577733f0a0a4265737420726567617264732c0a416c696365');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51012', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202332345d2044656172204f736361722c0a0a49742773206265656e206d6f7265207468616e2074776f207765656b732073696e6365204920686176652073656e74206d79207265706f72742e204861766520796f7520686561726420616e7920757064617465206e6577733f0a0a4265737420726567617264732c0a416c696365');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51013', 131072);
SELECT pg_catalog.lowrite(0, '\x4465617220416c6963652c0a0a4920616d206e6f74207375726520696620796f752772652061736b696e672074686520726967687420706572736f6e2e20596f7572207265706f727420697320676f696e6720746f206d79206f7468657220636f776f726b657220416c6963652e0a0a596f7520636f756c642073656e6420686572206d65737361676520766961207468697320656d61696c20616464726573733a206576612e677265656e407a61737472612e636f6d0a0a4920686f70652049206861766520696e666f726d656420796f7520636c6561726c792e0a0a0a4265737420726567617264732c0a4f7363617220506f6c6d616e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51014', 131072);
SELECT pg_catalog.lowrite(0, '\x48656920416c6963652c0a0a596f7572207265706f72742069732063757272656e746c79206265696e6720636865636b65642e0a0a4265737420726567617264732c0a4f73636172');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51015', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202332385d2044656172204f736361722c2069742773206265656e2074776f207765656b7320666f72206d79207265706f727420616e642074776f20646179732073696e636520746865206c6173742074696d6520492073656e7420796f7520616e20656d61696c2e20556e74696c206e6f772049276d206e6f742068656172696e6720616e797468696e672066726f6d20796f752e20436f756c6420796f7520726573706f6e7365206d79207265706f727420616e6420656d61696c3f2e204265737420726567617264732c20526f79');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51016', 131072);
SELECT pg_catalog.lowrite(0, '\x48692c20526f790a0a596f7572207265706f72742069732063757272656e746c7920756e6465722072657669657765642e204966207468657265277320616e7920757064617465207765276c6c2075706461746520796f7520617320736f6f6e20617320706f737369626c652e0a0a4265737420726567617264732c0a4f73636172');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51017', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f727420233132335d2054657374206d6573736167652066726f6d20506f73746d616e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51018', 131072);
SELECT pg_catalog.lowrite(0, '\x74686973206973207468652074657374206d6573736167652e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51019', 131072);
SELECT pg_catalog.lowrite(0, '\x74686973206973207468652074657374206d6573736167652e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51020', 131072);
SELECT pg_catalog.lowrite(0, '\x7965732c20746573742073656e6473206261636b2e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51021', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202332385d2044656172204f736361722c2069742773206265656e2032207765656b732073696e6365204927766520706f73746564206d79207265706f72742061626f757420556e6574686963616c20477261666669746920616e64204920686176656e277420686561726420616e79206e657773207570646174652061626f75742069742e0a0a436f756c6420796f7520706c65617365206c6574206d65206b6e6f7720776861742773207468652075706461746564206e65777320666f722074686973207265706f727420285265706f727420233238292e0a0a49276d206c6f6f6b696e6720666f727761726420746f2068656172696e672066726f6d20796f752e0a0a0a4772656574696e67732c0a526f7920532e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51022', 131072);
SELECT pg_catalog.lowrite(0, '\x4465617220526f792c0a0a4669727374206f6620616c6c2c207468616e6b20796f7520666f7220796f7572206d6573736167652e20596f7572207265706f72742069732063757272656e746c79206265696e6720726576696577732e204966207468657265277320616e79207570646174652c2049276c6c206c657420796f75206b6e6f7720617320736f6f6e20617320706f737369626c652e0a0a4265737420726567617264732c0a4f7363617220506f6c6c6d616e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51023', 131072);
SELECT pg_catalog.lowrite(0, '\x4465617220526f792c0a0a4669727374206f6620616c6c2c207468616e6b20796f7520666f7220796f7572206d6573736167652e20596f7572207265706f72742069732063757272656e746c79206265696e6720726576696577732e204966207468657265277320616e79207570646174652c2049276c6c206c657420796f75206b6e6f7720617320736f6f6e20617320706f737369626c652e0a0a4265737420726567617264732c0a4f7363617220506f6c6c6d616e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51024', 131072);
SELECT pg_catalog.lowrite(0, '\x44656172204f736361722c0a0a57686174206120676f6f64206e657773212046696e616c6c79206d79207265706f7274206973206265696e6720756e64657220746865207265766965772e2049276d206c6f6f6b696e6720666f727761726420746f2068656172696e672066726f6d20796f752e0a0a4265737420726567617264732c0a526f792e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51025', 131072);
SELECT pg_catalog.lowrite(0, '\x48692c20526f790a0a596f7572207265706f72742069732063757272656e746c7920756e6465722072657669657765642e204966207468657265277320616e7920757064617465207765276c6c2075706461746520796f7520617320736f6f6e20617320706f737369626c652e0a0a4265737420726567617264732c0a4f73636172');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51030', 131072);
SELECT pg_catalog.lowrite(0, '\x54686973206973206a75737420612074657374206d65737361676521');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51031', 131072);
SELECT pg_catalog.lowrite(0, '\x54657374205465737420212121');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51032', 131072);
SELECT pg_catalog.lowrite(0, '\x44656172204f736361722c0a0a57686174206120676f6f64206e657773212046696e616c6c79206d79207265706f7274206973206265696e6720756e64657220746865207265766965772e2049276d206c6f6f6b696e6720666f727761726420746f2068656172696e672066726f6d20796f752e0a0a4265737420726567617264732c0a526f792e');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51033', 131072);
SELECT pg_catalog.lowrite(0, '\x54657374207465737421');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51034', 131072);
SELECT pg_catalog.lowrite(0, '\x54657374207465737421');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51035', 131072);
SELECT pg_catalog.lowrite(0, '\x74657374207465737421');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51036', 131072);
SELECT pg_catalog.lowrite(0, '\x74657374207465737421');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51037', 131072);
SELECT pg_catalog.lowrite(0, '\x7465737420746573742121');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51038', 131072);
SELECT pg_catalog.lowrite(0, '\x7465737420746573742121');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51039', 131072);
SELECT pg_catalog.lowrite(0, '\x746573742074657374');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51040', 131072);
SELECT pg_catalog.lowrite(0, '\x746573742074657374');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51041', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202333325d204869204576612c0a0a486f7720697320697420676f696e6720736f2066617220666f7220746865207265706f74202333323a204361626c65206f6e204d61696e205374726565742e2049742773206265656e206d6f7265207468616e20736576656e207765656b20616e642074686973206d7573742068617070656e206e6f77206265636175736520656c656374726963206361626c6573206c79696e67206f6e20746865207374726565742069732064616e6765726f75732e20576520636f756c646e2774207269736b2070656f706c65207361666574792e0a0a506c656173652c206b696e646c792070726f636573732074686973207265706f727420617361702e204f74686572776973652c20696620796f75206861766520616e792070726f626c656d20776520636f756c6420616c77617973206d616b652074696d6520666f722061206d656574696e672e204a757374206c6574206d65206b6e6f772e0a0a4368656572732c0a4c696e6461');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51042', 131072);
SELECT pg_catalog.lowrite(0, '\x5b5265706f7274202333325d204869204576612c0a0a486f7720697320697420676f696e6720736f2066617220666f7220746865207265706f74202333323a204361626c65206f6e204d61696e205374726565742e2049742773206265656e206d6f7265207468616e20736576656e207765656b20616e642074686973206d7573742068617070656e206e6f77206265636175736520656c656374726963206361626c6573206c79696e67206f6e20746865207374726565742069732064616e6765726f75732e20576520636f756c646e2774207269736b2070656f706c65207361666574792e0a0a506c656173652c206b696e646c792070726f636573732074686973207265706f727420617361702e204f74686572776973652c20696620796f75206861766520616e792070726f626c656d20776520636f756c6420616c77617973206d616b652074696d6520666f722061206d656574696e672e204a757374206c6574206d65206b6e6f772e0a0a4368656572732c0a4c696e6461');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51043', 131072);
SELECT pg_catalog.lowrite(0, '\x4869204c696e64612c0a0a5468616e6b20796f7520666f7220796f757220656d61696c2e20492764206c696b6520746f20686176652061206d656574696e6720746f6d6f72726f77206174203130414d2e20576f756c64206974206265206f6b617920666f7220796f753f0a0a526567617264732c0a457661');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51044', 131072);
SELECT pg_catalog.lowrite(0, '\x4869204576612c0a0a5965732c207468617420776f756c646e277420626520612070726f626c656d20666f72206d652e2049276c6c20726573657276652061206d656574696e6720726f6f6d2066726f6d203130414d20746f203131414d2e20416e20686f757220776f756c6420626520656e6f75676820746f20646973637573732074686973207265706f72742c20776f756c646e27742069743f0a0a4368656572732c0a4c696e6461');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51045', 131072);
SELECT pg_catalog.lowrite(0, '\x4869204576612c0a0a5965732c207468617420776f756c646e277420626520612070726f626c656d20666f72206d652e2049276c6c20726573657276652061206d656574696e6720726f6f6d2066726f6d203130414d20746f203131414d2e20416e20686f757220776f756c6420626520656e6f75676820746f20646973637573732074686973207265706f72742c20776f756c646e27742069743f0a0a4368656572732c0a4c696e6461');
SELECT pg_catalog.lo_close(0);

SELECT pg_catalog.lo_open('51046', 131072);
SELECT pg_catalog.lowrite(0, '\x4869204c696e64612c0a0a5468616e6b7320666f7220796f757220717569636b20726573706f6e642e205965732c206f6e6520686f757220776f756c6420626520656e6f7567682e205468616e6b7320616e642073656520796f7520746f6d6f72726f77210a0a5265676164732c0a457661');
SELECT pg_catalog.lo_close(0);

COMMIT;

-- Completed on 2025-11-30 19:10:35

--
-- PostgreSQL database dump complete
--

