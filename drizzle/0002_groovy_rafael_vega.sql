CREATE TABLE "user_suscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"stripe_customer_id" varchar(256) NOT NULL,
	"stripe_subscription_id" varchar(256),
	"stripe_price_id" varchar(256),
	"stripe_current_period_end" timestamp,
	CONSTRAINT "user_suscriptions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_suscriptions_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "user_suscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
